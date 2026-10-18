import csv, json, sys
OUT = sys.argv[1]

STYLE = ("Modern stylized editorial illustration for a broad adult audience, soft semi-3D look: clean rounded forms, smooth matte surfaces, "
 "soft directional lighting with gentle shadows, natural human proportions (NOT chibi, NOT big heads, NOT a children's book or toy look), "
 "calm confident expressions with subtle dry humor, refined slightly muted palette with one warm accent. Landscape 4:3 frame. "
 "Close-up composition: ONE main subject, large, filling about 70% of the frame, readable at small size on a phone. "
 "Plain flat background color {bg}, no scenery clutter unless the scene requires it. "
 "STRICTLY NO TEXT: no letters, words, numbers, signs with writing, labels, logos, brand names or watermarks anywhere. "
 "Any paper, screen, sign or board must be blank or show only simple pictograms and abstract lines.")
# Two recurring heroes. Descriptions are filled in once the look is agreed.
AGE = sys.argv[2] if len(sys.argv)>2 else "adult"
AGES = {"adult": ("a young woman in her early twenties", "a young man in his early twenties"),
        "kids":  ("a girl about 10 years old", "a boy about 8 years old")}
HEROES = {
 "A": f"Hero A, the sister (keep identical in every image): {AGES[AGE][0]}, slim, light brown (dark blonde) straight hair to the shoulders, hazel-green eyes, "
      "eyebrows gently raised at the inner ends giving a soft thoughtful look, light skin; always wears a mustard-yellow jacket over a white t-shirt and dark jeans.",
 "B": f"Hero B, the brother (keep identical in every image): {AGES[AGE][1]}, slim, light ash-blond short hair, grey-blue eyes with a very subtle almond shape "
      "slightly lifted at the outer corners, light skin; always wears a violet hoodie, grey trousers and white sneakers.",
}
HERO = HEROES["A"]+" "+HEROES["B"]
BG = {"air":"lavender #E7E2F7","money":"butter yellow #FFF1C2","nature":"mint #D5F5E6","city":"peach #FFE1DA"}

K = "оставить"
R = "переделать"
# word, ru, bg, decision, reason, scene, distinguish/avoid, hero
W = [
("luggage","багаж","air",K,"","A tall wobbly tower of several mismatched suitcases and bags stacked on an airport trolley, the hero pushing it with effort.","Show MANY bags, not a single suitcase.",1),
("passport","паспорт","air",R,"надпись PASSPORT","A closed dark-red passport booklet seen at a slight angle, the cover completely blank except an embossed golden globe emblem; the hero's hand holds it out.","No writing on the cover.",1),
("boarding pass","посадочный талон","air",R,"надпись BOARDING PASS","A boarding pass card with a tear-off stub, a barcode block and a small plane pictogram; all other details are abstract grey bars. The hero holds it next to an airplane window.","Must have the plane pictogram and stub so it differs from 'ticket'. No writing.",1),
("departure","отправление, вылет","air",R,"табло с текстом Departures","A plane climbing steeply away into the sky leaving a long curved trail, the hero on the ground waving goodbye with a big gesture.","Plane goes UP and AWAY. No signs or boards.",1),
("arrival","прибытие","air",R,"табло с текстом Arrivals","The hero walking out through sliding airport doors pulling a suitcase, a friend running to hug them holding colorful balloons.","Focus on being met/welcomed. No signs or boards.",1),
("delay","задержка","air",K,"","A passenger plane parked on the apron being slowly towed by a determined snail, the hero sitting on a suitcase checking a wristwatch with a deadpan look.","Plane is NOT flying.",1),
("to book","бронировать","air",K,"","The hero planting a small flag with a checkmark on a neatly made hotel bed, like claiming a summit.","Not a book as an object.",1),
("to check in","зарегистрироваться","air",R,"вывеска CHECK IN","At an airport counter the hero on tiptoes hands over a passport while a suitcase sits on a weighing scale belt; the counter screen shows only a suitcase pictogram.","No signs with writing.",1),
("gate","выход на посадку","air",R,"вывеска GATE A10","A wide glass doorway at an airport with the nose of a big plane right behind the glass, a short line of passengers walking through the door with bags.","No letters or numbers on any sign. Not a garden gate.",0),
("flight","рейс, перелёт","air",K,"","A small passenger plane flying above fluffy clouds along a dotted curved route line between two map pins.","Plane level in cruise, not taking off or landing.",0),
("to miss","опоздать, пропустить","city",K,"","The hero sprinting with a rolling suitcase as train doors close and the train pulls away just out of reach.","The leaving vehicle must be visible.",1),
("destination","пункт назначения","nature",K,"","A folded paper map with a long dotted path ending at a big glowing pin next to a tiny palm tree.","Single clear end point.",0),
("journey","путешествие","nature",K,"","The hero with a backpack seen from behind at the start of a long winding road that curls over hills toward the horizon.","Long road is the key, wide view.",1),
("souvenir","сувенир","city",R,"надпись PARIS","A snow globe with a tiny generic tower inside, a plain wooden base, the hero hugging it like a treasure.","No writing on the base. No real landmark.",1),
("sightseeing","осмотр достопримечательностей","city",K,"","The hero with a camera strap around the neck photographing a tall generic stone tower and an arch, slightly awed.","No real recognizable landmarks.",1),
("guide","гид","city",K,"","A tour guide holding a raised yellow flag on a stick, leading a neat line of tourists with cameras.","The flag and the following group are key.",0),
("hostel","хостел","city",K,"","A shared room with three-level bunk beds, a different sleepy traveler peeking from each bunk, backpacks hanging on the frame.","Not a hotel lobby.",0),
("receipt","чек","money",R,"надписи RECEIPT и $","An absurdly long paper receipt unrolling from the hero's hands down to the floor and curling up, covered only with abstract grey lines; the hero looks shocked.","No letters, numbers or currency symbols.",1),
("to exchange","обменять","money",K,"","The two heroes facing each other, each handing the other a banknote of a different color, curved arrows going both ways between their hands.","Two-way swap.",1),
("currency","валюта","money",K,"","A neat fan of banknotes in different colors and coins of different shapes: round, square, one with a hole.","No symbols or digits on money.",0),
("cash","наличные","money",K,"","A thick stack of banknotes held with a rubber band, the hero fanning themselves with it with mock elegance.","Paper money, not a bank card.",1),
("to rent","арендовать","city",K,"","The hero riding a scooter with a large rental key tag dangling from the handlebar.","Tag must be blank.",1),
("crowded","переполненный","city",K,"","A city bus packed so tightly that faces are squished against the windows and one arm sticks out of the door.","Overfull vehicle, not a street crowd.",0),
("schedule","расписание","air",R,"надпись SCHEDULE и цифры","A departure board made of rows, each row has only a small plane, train or bus pictogram and a small round clock face; no characters at all.","Board must contain zero letters and zero digits.",0),
("platform","платформа, перрон","city",R,"вывеска Platform 3","A railway platform edge with a yellow safety line and a bench, the hero waiting with a suitcase as a train approaches from the distance.","No signs with writing. Not a stage.",1),
("to land","приземляться","air",K,"","A plane touching down on a runway, small puffs of smoke from the wheels.","Plane going DOWN onto the runway.",0),
("seat belt","ремень безопасности","air",K,"","The hero in an airplane seat clicking the buckle of the seat belt, close-up on the buckle.","Airplane interior, not a car.",1),
("aisle","проход между рядами","air",K,"","A view down a narrow airplane aisle between rows of seats, a drinks cart blocking it and the hero stuck behind the cart.","The narrow passage is the focus.",1),
("customs","таможня","air",R,"вывеска CUSTOMS","A customs officer with a magnifying glass inspecting an open suitcase on a counter and discovering it is full of identical yellow rubber ducks; the hero looks embarrassed.","No signs or badges with writing.",1),
("border","граница","nature",R,"вывеска BORDER","A red-and-white striped barrier across a road; left half of the picture is a green meadow, right half a yellow desert, the hero standing exactly on the line between them.","No signs with writing.",1),
("ticket","билет","city",R,"надпись TICKET","A single paper train/bus ticket with a punched round hole and a perforated tear-off edge, the hero peeking through the hole with one eye.","No plane pictogram (that is 'boarding pass'). No writing.",1),
("jet lag","смена часовых поясов","air",R,"похоже на «exhausted»/сон","The hero sitting up in bed wide awake in the middle of the night, a window showing a moon, while a wall clock and a small sun pictogram float confused above their head.","Hero must be AWAKE at night, not sleeping.",1),
("sunburn","солнечный ожог","nature",K,"","The hero on a beach towel, skin bright coral red except a perfect pale outline where sunglasses were.","Not fire.",1),
("to pack","собирать вещи","city",K,"","The hero sitting on an overstuffed suitcase trying to zip it shut, socks and a sleeve sticking out.","Packing, not unpacking.",1),
("to wander","бродить","city",R,"похоже на «journey» и «to explore»","The hero strolling slowly with hands behind their back through narrow colorful old-town streets with flower pots, a dotted looping path behind them, no backpack.","Relaxed aimless walk in a TOWN, no mountains, no hiking gear.",1),
("view","вид","nature",K,"","An open hotel window onto a dramatic mountain range at sunrise, the hero leaning on the sill, seen from behind.","Not a TV screen.",1),
("tent","палатка","nature",K,"","A small triangular camping tent by a lake, the head of the hero poking out of the entrance.","Not a circus tent.",1),
("abroad","за границей","city",R,"похоже на «flight»","A small globe; the hero stands on the far side of it waving, while on the opposite side a tiny house with a little flag waves back.","No plane.",1),
("to get lost","заблудиться","city",K,"","The two heroes in the middle of a hedge maze, one holding a map upside down, the other pointing in a different direction.","Clearly lost, not a calm walk.",1),
("directions","указания, как пройти","city",K,"","A friendly local pointing confidently one way while a signpost behind points three other ways; the two heroes look at each other, puzzled.","Signposts with arrows only, no writing.",1),
("traffic jam","пробка","city",K,"","A long line of cars bumper to bumper, a pigeon walking faster on the sidewalk next to them.","Cars are not moving.",0),
("fare","стоимость проезда","money",R,"надпись TICKET","A hand dropping a coin into the slot of a bus fare machine; the machine shows only a glowing bus pictogram.","No writing or prices.",0),
("round trip","туда и обратно","air",K,"","Two small houses connected by a circular two-way arrow loop, a tiny bus driving along the loop.","Out and back, loop arrow.",0),
("breathtaking","захватывающий дух","nature",K,"","The hero standing in front of a giant waterfall with a rainbow, jaw dropped, hands on the head.","Amazement, not fear.",1),
("exhausted","измотанный","city",K,"","The hero lying face down on a hotel bed still wearing a backpack and shoes, one hand raising a tiny white flag.","Collapsed, not peacefully sleeping.",1),
("to explore","исследовать","nature",R,"похоже на «journey» и «to wander»","The hero in an explorer hat pushing aside giant jungle leaves, holding binoculars, eyes wide with curiosity.","Jungle and binoculars, not a mountain trail.",1),
("lost and found","бюро находок","city",R,"надпись LOST AND FOUND","A shelf crowded with forgotten things: umbrellas, single gloves, a hat, a teddy bear and one confused rubber duck; small blank tags tied to each item.","Tags must be blank. No signs.",0),
("queue","очередь","city",K,"","A long orderly line of people standing one behind another at a counter, the last one carrying a folding chair.","Ordered line, not a crowd.",0),
("refund","возврат денег","money",R,"надпись REFUND","Banknotes flying back into an open wallet along a big curved return arrow, the hero cheering next to it.","No writing on the banknotes or wallet.",1),
("to cancel","отменить","air",K,"","A calendar page with one day crossed out by a big coral X, the hero holding an oversized marker with a guilty look.","Calendar has no digits.",1),
]
assert len(W)==50

both={"arrival","customs","directions","to exchange","to get lost"}
rows=[]
for i,(w,ru,bg,dec,why,scene,dist,hero) in enumerate(W,1):
    if w in both: hero, who = 1, "AB"
    elif hero: who = "A" if (cnt:=globals().setdefault("_c",[0]))[0]%2==0 else "B"; cnt[0]+=1
    else: who = ""
    sc = scene.replace("the two heroes","Hero A and Hero B").replace("The two heroes","Hero A and Hero B").replace("the hero","Hero "+(who[0] if who else "A")).replace("The hero","Hero "+(who[0] if who else "A")).replace("a friend running","Hero B running")
    heroes = " ".join(HEROES[c] for c in who)
    if who=="AB": heroes += " Both heroes appear in this scene."
    p = STYLE.format(bg=BG[bg]) + (" "+heroes if heroes else "") + f" Scene: {sc}" + (f" Important: {dist}" if dist else "") + f" The image must clearly mean the English word '{w}'."
    rows.append({"№":i,"слово":w,"перевод":ru,"было в вашем наборе":"годилась" if dec==K else "переделать","почему переделать":why,
                 "фон":BG[bg],"герой": {"A":"A","B":"B","AB":"A и B","":"—"}[who],"промпт (EN)":p})

with open(OUT+".csv","w",encoding="utf-8-sig",newline="") as f:
    wr=csv.DictWriter(f,fieldnames=list(rows[0].keys())); wr.writeheader(); wr.writerows(rows)
with open(OUT+"-vse-50.txt","w",encoding="utf-8") as f:
    for r in rows:
        if True:
            f.write(f"#{r['№']} {r['слово']} — {r['перевод']}  {('— было: '+r['почему переделать']) if r['почему переделать'] else ''}\n{r['промпт (EN)']}\n\n")
with open(OUT+"-geroj.txt","w",encoding="utf-8") as f:
    f.write("Character reference sheet for two recurring characters. "+HERO+" Show each of them four times: front, side, back and one expressive pose, standing side by side for height comparison. "
            +STYLE.format(bg=BG['air'])+"\n")
print(len(rows))
