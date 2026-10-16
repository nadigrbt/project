<?php
/**
 * Обработчик формы «Хотите задать вопрос?».
 * Отправляет заявку в Telegram и/или на почту (настройки — в config.php).
 * Работает на обычном хостинге Timeweb с PHP 7.4+.
 */

header('Content-Type: application/json; charset=utf-8');

function reply(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'method']);
}

$config = require __DIR__ . '/config.php';

// Ловушка для ботов: поле website люди не видят и не заполняют
if (!empty($_POST['website'])) {
    reply(200, ['ok' => true]);
}

// Защита от частых повторных отправок с одного адреса (не чаще раза в 30 с)
$ipKey = sys_get_temp_dir() . '/aj_form_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
if (is_file($ipKey) && time() - filemtime($ipKey) < 30) {
    reply(429, ['ok' => false, 'error' => 'too_often']);
}

$clean = fn($v, $max) => mb_substr(trim(strip_tags((string)($v ?? ''))), 0, $max);

$name    = $clean($_POST['name'] ?? '', 80);
$phone   = preg_replace('/\D/', '', (string)($_POST['phone'] ?? ''));
$message = $clean($_POST['message'] ?? '', 2000);
$consent = !empty($_POST['consent']);

if (strlen($phone) === 11 && ($phone[0] === '7' || $phone[0] === '8')) {
    $phone = substr($phone, 1);
}
if (strlen($phone) !== 10) {
    reply(422, ['ok' => false, 'error' => 'phone']);
}
if (!$consent) {
    reply(422, ['ok' => false, 'error' => 'consent']);
}

$phoneFmt = sprintf('+7 (%s) %s-%s-%s', substr($phone, 0, 3), substr($phone, 3, 3), substr($phone, 6, 2), substr($phone, 8, 2));
$page = $clean($_SERVER['HTTP_REFERER'] ?? '', 300);

$lines = [
    'Новый вопрос с сайта clinic-aj.ru',
    'Имя: ' . ($name !== '' ? $name : '—'),
    'Телефон: ' . $phoneFmt,
    'Вопрос: ' . ($message !== '' ? $message : '—'),
    'Страница: ' . ($page !== '' ? $page : '—'),
    'Согласие на обработку ПД: да',
];
$text = implode("\n", $lines);

$sent = false;

// --- Telegram ---
if (!empty($config['telegram_token']) && !empty($config['telegram_chat_id'])) {
    $url = 'https://api.telegram.org/bot' . $config['telegram_token'] . '/sendMessage';
    $ctx = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query(['chat_id' => $config['telegram_chat_id'], 'text' => $text]),
        'timeout' => 10,
    ]]);
    $res = @file_get_contents($url, false, $ctx);
    if ($res !== false && strpos($res, '"ok":true') !== false) {
        $sent = true;
    }
}

// --- Почта ---
if (!empty($config['email_to'])) {
    $subject = '=?UTF-8?B?' . base64_encode('Вопрос с сайта A&J') . '?=';
    $headers = implode("\r\n", [
        'From: ' . $config['email_from'],
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    if (@mail($config['email_to'], $subject, $text, $headers)) {
        $sent = true;
    }
}

if (!$sent) {
    reply(500, ['ok' => false, 'error' => 'not_sent']);
}

@touch($ipKey);
reply(200, ['ok' => true]);
