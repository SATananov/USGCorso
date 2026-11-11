do $$
declare
  admin_user uuid;
  item record;
  existing_id uuid;
begin
  select ur.user_id
  into admin_user
  from public.user_roles ur
  where ur.role = 'admin'
  order by ur.created_at asc, ur.user_id asc
  limit 1;

  if admin_user is null then
    raise exception 'No admin user found in public.user_roles';
  end if;

  for item in
    select *
    from (
      values
    ('health_care', $ttl$Кърлежи: малък паразит, голям риск$ttl$, $bdy$Кърлежите не са само неприятни външни паразити. Те могат да пренасят причинители на различни заболявания и рискът зависи от района, сезона, начина на живот и местата, които кучето посещава.

При Cane Corso, което прекарва време навън, в трева, храсти, дворове или селски райони, редовната проверка на кожата е важна. Особено внимание заслужават ушите, шията, подмишниците, слабините, пространствата между пръстите и зоните с по-тънка козина.

След ухапване от кърлеж могат да се появят отпадналост, температура, намален апетит, куцота, слабост, бледи венци или промени в урината. Тези признаци не са специфични и не позволяват диагноза само по наблюдение.

Кърлежът трябва да бъде отстранен правилно, без стискане и разкъсване на тялото му. Ако не сте сигурни как да го направите, потърсете ветеринарна помощ.

Постоянната профилактика срещу кърлежи намалява риска от инфестация и пренасяне на инфекциозни агенти. Подходящият продукт и честотата на приложение трябва да бъдат избрани с ветеринар според кучето и местния риск.

След престой в рискова среда оглеждайте кучето, дори ако използвате профилактика. Нито една мярка не замества наблюдението.

При висока температура, силна отпадналост, колапс, много бледи венци, тъмна урина или бързо влошаване е необходима незабавна ветеринарна оценка.

Този материал е образователен и не замества ветеринарна диагноза или индивидуална противопаразитна програма.$bdy$),
    ('health_care', $ttl$Бълхи: не само сърбеж$ttl$, $bdy$Бълхите могат да причинят много повече от краткотраен сърбеж. При част от кучетата ухапванията предизвикват силна алергична реакция, а постоянната инфестация може да доведе до кожни възпаления, вторични инфекции и при тежки случаи до значима кръвозагуба при малки или уязвими животни.

Типични признаци са чесане, хапане на кожата, неспокойствие, зачервяване, косопад и тъмни частички в козината, които могат да бъдат бълхи или техни изпражнения.

Проблемът не е само върху кучето. Голяма част от жизнения цикъл на бълхата протича в средата — легла, килими, пукнатини и места, където животното почива. Затова установена домашна инфестация може да изисква време и последователност за контрол.

Всички животни в дома трябва да бъдат обсъдени с ветеринар при обща паразитна програма, защото необработен домашен любимец може да поддържа цикъла.

Бълхите могат да участват и в предаването на други паразити и инфекциозни агенти. Ето защо профилактиката е част от общата здравна грижа, а не само козметична мярка.

Не използвайте случайни инсектицидни продукти и никога не прилагайте продукт, предназначен за друг животински вид, без ветеринарна препоръка.

При силно възпалена кожа, рани, гнойни участъци, изразен косопад или отпадналост е необходим ветеринарен преглед.

Този материал е образователен и не замества ветеринарна диагноза или индивидуална противопаразитна програма.$bdy$),
    ('health_care', $ttl$Комари и дирофилария: превенцията е ключът$ttl$, $bdy$Дирофилариозата се причинява от паразитни червеи, които се предават чрез ухапване от заразен комар. При кучето Dirofilaria immitis може да засегне белодробните артерии, сърцето и общото физическо състояние.

Рискът зависи от географския район, пътуванията, сезона и наличието на комари. Затова профилактичният план трябва да бъде съобразен с местния риск и обсъден с ветеринарен лекар.

В ранните стадии кучето може да няма очевидни признаци. По-късно могат да се появят кашлица, лесна уморяемост, намалена издръжливост, затруднено дишане, отслабване или слабост. Тези признаци не са специфични и не могат да потвърдят заболяването без изследвания.

Диагностиката може да включва кръвни тестове, а при нужда и допълнителни образни или кардиологични изследвания. При кучета, изложени на риск, редовното тестване е важна част от профилактиката.

Предпазването от дирофилария е много по-безопасна стратегия от чакането да се появят симптоми. Подходящият препарат и график се определят от ветеринар според региона, възрастта, теглото, здравословното състояние и предишната профилактика.

Не започвайте или прекъсвайте противопаразитна профилактика произволно, особено ако има пропуснати периоди или неизвестен статус.

Тежко затруднено дишане, колапс, внезапна слабост или силно влошаване изискват спешна ветеринарна помощ.

Този материал е образователен и не замества ветеринарен тест, диагноза или индивидуален профилактичен план.$bdy$),
    ('health_care', $ttl$Чревни паразити: невидимият риск$ttl$, $bdy$Чревните паразити при кучетата включват различни организми, сред които кръгли червеи, анкилостоми, камшичести червеи, тении и протозои като Giardia. Някои инфекции протичат без очевидни симптоми.

Когато има признаци, те могат да включват диария, слуз или кръв в изпражненията, повръщане, подут корем, загуба на тегло, лошо състояние на козината, слабост или забавен растеж при младите кучета.

Кученцата са особено важна група, защото някои паразити могат да бъдат предадени още в ранния живот и по-тежко да повлияят на растежа и общото състояние.

Фекалното изследване е основен инструмент за контрол. Един отрицателен резултат не винаги изключва всяка паразитна инфекция, защото отделянето на яйца или други диагностични форми може да бъде непостоянно.

Добрата хигиена е част от профилактиката: събиране на изпражненията, поддържане на чисти места за хранене и вода и ограничаване на достъпа до замърсени източници.

Някои чревни паразити имат значение и за човешкото здраве, затова контролът им защитава не само кучето, но и средата около него.

Профилактиката и изследванията трябва да бъдат съобразени с възрастта, начина на живот, контакта с други животни, пътуванията и местния паразитен риск. Не обезпаразитявайте на случаен принцип с неизвестни продукти или дози.

Продължителна диария, кръв в изпражненията, повръщане, обезводняване, силна слабост или загуба на тегло изискват ветеринарна оценка.

Този материал е образователен и не замества фекално изследване, ветеринарна диагноза или индивидуална програма за обезпаразитяване.$bdy$)
    ) as v(category_key, material_title, material_body)
  loop
    select ci.id
    into existing_id
    from public.content_items ci
    where ci.section_key = 'knowledge'
      and ci.context_type = item.category_key
      and ci.title = item.material_title
    order by ci.created_at asc
    limit 1;

    if existing_id is null then
      insert into public.content_items (
        owner_user_id,
        section_key,
        content_type,
        title,
        body,
        context_type,
        context_id,
        status,
        moderation_note,
        approved_by,
        approved_at,
        created_at,
        updated_at
      )
      values (
        admin_user,
        'knowledge',
        'article',
        item.material_title,
        item.material_body,
        item.category_key,
        null,
        'approved',
        'USG Editorial · Parasites & Vectors · Knowledge Content Pack 06',
        admin_user,
        now(),
        now(),
        now()
      )
      returning id into existing_id;

      insert into public.content_audit_log (
        content_item_id,
        actor_user_id,
        actor_role,
        action,
        from_status,
        to_status,
        details
      )
      values (
        existing_id,
        admin_user,
        'admin',
        'editorial_seed_created',
        null,
        'approved',
        jsonb_build_object(
          'source', 'USG Editorial Parasites & Vectors',
          'pack', 'KNOWLEDGE_CONTENT_PACK_06',
          'category', item.category_key
        )
      );
    else
      update public.content_items
      set
        owner_user_id = admin_user,
        content_type = 'article',
        body = item.material_body,
        status = 'approved',
        moderation_note = 'USG Editorial · Parasites & Vectors · Knowledge Content Pack 06',
        approved_by = admin_user,
        approved_at = coalesce(approved_at, now()),
        updated_at = now()
      where id = existing_id;

      insert into public.content_audit_log (
        content_item_id,
        actor_user_id,
        actor_role,
        action,
        from_status,
        to_status,
        details
      )
      values (
        existing_id,
        admin_user,
        'admin',
        'editorial_seed_updated',
        'approved',
        'approved',
        jsonb_build_object(
          'source', 'USG Editorial Parasites & Vectors',
          'pack', 'KNOWLEDGE_CONTENT_PACK_06',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Кърлежи: малък паразит, голям риск$bgt$, 'en', $ttl$Ticks: A Small Parasite, a Serious Risk$ttl$, $bdy$Ticks are more than unpleasant external parasites. They can transmit a variety of disease-causing agents, and the risk depends on geography, season, lifestyle, and the environments a dog visits.

For a Cane Corso that spends time outdoors in grass, brush, yards, or rural areas, regular skin checks are important. Pay particular attention to the ears, neck, armpits, groin, spaces between the toes, and areas with thinner hair.

After a tick bite, signs such as lethargy, fever, reduced appetite, lameness, weakness, pale gums, or changes in urine may occur. These signs are not specific and cannot establish a diagnosis by observation alone.

A tick should be removed correctly without crushing or tearing its body. If you are unsure how to do this, seek veterinary help.

Consistent tick prevention reduces the risk of infestation and transmission of infectious agents. The appropriate product and schedule should be selected with a veterinarian according to the dog and local risk.

Check the dog after exposure to high-risk environments even when preventive protection is used. No preventive measure replaces observation.

High fever, marked lethargy, collapse, very pale gums, dark urine, or rapid deterioration requires prompt veterinary assessment.

This material is educational and does not replace veterinary diagnosis or an individualized parasite-control plan.$bdy$),
    ($bgt$Кърлежи: малък паразит, голям риск$bgt$, 'it', $ttl$Zecche: un piccolo parassita, un rischio serio$ttl$, $bdy$Le zecche non sono soltanto fastidiosi parassiti esterni. Possono trasmettere diversi agenti patogeni e il rischio dipende da area geografica, stagione, stile di vita e ambienti frequentati dal cane.

Per un Cane Corso che trascorre tempo all'aperto, nell'erba, nei cespugli, nei cortili o in zone rurali, il controllo regolare della cute è importante. Occorre osservare con particolare attenzione orecchie, collo, ascelle, inguine, spazi tra le dita e zone con pelo più rado.

Dopo il morso di una zecca possono comparire letargia, febbre, riduzione dell'appetito, zoppia, debolezza, gengive pallide o cambiamenti delle urine. Questi segni non sono specifici e non consentono una diagnosi basata soltanto sull'osservazione.

La zecca deve essere rimossa correttamente senza schiacciarne o strapparne il corpo. Se non si è sicuri della procedura, è opportuno rivolgersi al veterinario.

Una prevenzione costante contro le zecche riduce il rischio di infestazione e di trasmissione di agenti infettivi. Il prodotto e la frequenza più adatti devono essere scelti con il veterinario in base al cane e al rischio locale.

Controllare il cane dopo l'esposizione ad ambienti a rischio anche quando viene utilizzata una prevenzione. Nessuna misura preventiva sostituisce l'osservazione.

Febbre alta, forte abbattimento, collasso, gengive molto pallide, urine scure o rapido peggioramento richiedono una valutazione veterinaria tempestiva.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria o un programma antiparassitario individuale.$bdy$),
    ($bgt$Бълхи: не само сърбеж$bgt$, 'en', $ttl$Fleas: More Than an Itch$ttl$, $bdy$Fleas can cause much more than temporary itching. In some dogs, flea bites trigger a strong allergic reaction, while persistent infestation can lead to skin inflammation, secondary infection, and, in severe cases, meaningful blood loss in small or vulnerable animals.

Common signs include scratching, chewing at the skin, restlessness, redness, hair loss, and dark particles in the coat that may represent fleas or flea dirt.

The problem is not limited to the dog. Much of the flea life cycle occurs in the environment — bedding, carpets, cracks, and resting areas. For this reason, an established household infestation can require time and consistent control.

All pets in the household should be considered with a veterinarian as part of a coordinated parasite-control plan, because an untreated animal can maintain the infestation cycle.

Fleas can also participate in the transmission of other parasites and infectious agents. Prevention is therefore part of general health care, not merely a cosmetic measure.

Do not use random insecticidal products, and never apply a product intended for another animal species without veterinary guidance.

Severely inflamed skin, wounds, pus-producing lesions, marked hair loss, or lethargy should prompt veterinary examination.

This material is educational and does not replace veterinary diagnosis or an individualized parasite-control plan.$bdy$),
    ($bgt$Бълхи: не само сърбеж$bgt$, 'it', $ttl$Pulci: non solo prurito$ttl$, $bdy$Le pulci possono provocare molto più di un prurito temporaneo. In alcuni cani i loro morsi scatenano una forte reazione allergica, mentre un'infestazione persistente può causare infiammazione cutanea, infezioni secondarie e, nei casi gravi, una perdita di sangue importante nei soggetti piccoli o vulnerabili.

I segni comuni comprendono grattamento, mordicchiamento della cute, irrequietezza, arrossamento, perdita di pelo e particelle scure nel mantello che possono essere pulci o loro deiezioni.

Il problema non riguarda soltanto il cane. Gran parte del ciclo vitale della pulce avviene nell'ambiente — cucce, tappeti, fessure e zone di riposo. Per questo un'infestazione domestica già stabilita può richiedere tempo e costanza per essere controllata.

Tutti gli animali presenti in casa dovrebbero essere considerati insieme al veterinario in un programma antiparassitario coordinato, perché un animale non trattato può mantenere il ciclo dell'infestazione.

Le pulci possono inoltre contribuire alla trasmissione di altri parassiti e agenti infettivi. La prevenzione fa quindi parte della cura generale della salute e non è soltanto una misura cosmetica.

Non utilizzare insetticidi scelti casualmente e non applicare mai un prodotto destinato a un'altra specie animale senza indicazione veterinaria.

Cute fortemente infiammata, ferite, lesioni purulente, marcata perdita di pelo o abbattimento richiedono una visita veterinaria.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria o un programma antiparassitario individuale.$bdy$),
    ($bgt$Комари и дирофилария: превенцията е ключът$bgt$, 'en', $ttl$Mosquitoes and Heartworm: Prevention Is Key$ttl$, $bdy$Heartworm disease is caused by parasitic worms transmitted through the bite of an infected mosquito. In dogs, Dirofilaria immitis can affect the pulmonary arteries, the heart, and overall physical condition.

Risk varies with geography, travel, season, and mosquito exposure. The preventive plan should therefore reflect local risk and be discussed with a veterinarian.

In early infection, a dog may show no obvious signs. Later, coughing, easy fatigue, reduced exercise tolerance, breathing difficulty, weight loss, or weakness may develop. These signs are not specific and cannot confirm the disease without testing.

Diagnosis can include blood tests and, when indicated, additional imaging or cardiac evaluation. In dogs at risk, regular testing is an important part of prevention.

Preventing heartworm disease is a far safer strategy than waiting for symptoms to appear. The appropriate preventive product and schedule should be determined by a veterinarian according to region, age, weight, health status, and previous preventive history.

Do not start or stop parasite prevention arbitrarily, especially when doses have been missed or the dog's status is unknown.

Severe breathing difficulty, collapse, sudden weakness, or marked deterioration requires emergency veterinary care.

This material is educational and does not replace veterinary testing, diagnosis, or an individualized preventive plan.$bdy$),
    ($bgt$Комари и дирофилария: превенцията е ключът$bgt$, 'it', $ttl$Zanzare e filariosi cardiopolmonare: la prevenzione è fondamentale$ttl$, $bdy$La filariosi cardiopolmonare è causata da vermi parassiti trasmessi attraverso la puntura di una zanzara infetta. Nel cane, Dirofilaria immitis può interessare le arterie polmonari, il cuore e la condizione fisica generale.

Il rischio varia in base all'area geografica, ai viaggi, alla stagione e all'esposizione alle zanzare. Il piano preventivo deve quindi essere adattato al rischio locale e discusso con il veterinario.

Nelle fasi iniziali il cane può non mostrare segni evidenti. Successivamente possono comparire tosse, facile affaticamento, ridotta tolleranza all'esercizio, difficoltà respiratoria, perdita di peso o debolezza. Questi segni non sono specifici e non possono confermare la malattia senza esami.

La diagnosi può comprendere esami del sangue e, quando indicato, ulteriori indagini diagnostiche o cardiologiche. Nei cani esposti al rischio, i controlli regolari sono una parte importante della prevenzione.

Prevenire la filariosi è una strategia molto più sicura che attendere la comparsa dei sintomi. Il prodotto e il programma preventivo più adatti devono essere stabiliti dal veterinario in base a regione, età, peso, stato di salute e precedente profilassi.

Non iniziare o interrompere arbitrariamente la prevenzione antiparassitaria, soprattutto se sono state saltate somministrazioni o se lo stato del cane non è noto.

Grave difficoltà respiratoria, collasso, debolezza improvvisa o marcato peggioramento richiedono assistenza veterinaria urgente.

Questo materiale è educativo e non sostituisce test veterinari, diagnosi o un piano preventivo individuale.$bdy$),
    ($bgt$Чревни паразити: невидимият риск$bgt$, 'en', $ttl$Intestinal Parasites: The Hidden Risk$ttl$, $bdy$Intestinal parasites in dogs include a variety of organisms such as roundworms, hookworms, whipworms, tapeworms, and protozoa such as Giardia. Some infections can occur without obvious signs.

When signs are present, they may include diarrhea, mucus or blood in the stool, vomiting, abdominal distension, weight loss, poor coat condition, weakness, or impaired growth in young dogs.

Puppies are an especially important group because some parasites can be acquired very early in life and can have a greater effect on growth and general health.

Fecal testing is a key control tool. A single negative result does not always exclude every parasitic infection because shedding of eggs or other diagnostic stages may be intermittent.

Good hygiene is part of prevention: prompt removal of feces, keeping food and water areas clean, and reducing access to contaminated sources.

Some intestinal parasites also have public-health importance, so controlling them protects not only the dog but also the surrounding environment.

Testing and preventive strategies should reflect age, lifestyle, contact with other animals, travel, and local parasite risk. Do not deworm randomly with unknown products or doses.

Persistent diarrhea, blood in the stool, vomiting, dehydration, marked weakness, or weight loss requires veterinary assessment.

This material is educational and does not replace fecal testing, veterinary diagnosis, or an individualized deworming program.$bdy$),
    ($bgt$Чревни паразити: невидимият риск$bgt$, 'it', $ttl$Parassiti intestinali: il rischio nascosto$ttl$, $bdy$I parassiti intestinali del cane comprendono diversi organismi, tra cui ascaridi, anchilostomi, tricocefali, tenie e protozoi come Giardia. Alcune infezioni possono essere presenti senza segni evidenti.

Quando compaiono sintomi, possono includere diarrea, muco o sangue nelle feci, vomito, distensione addominale, perdita di peso, mantello in cattive condizioni, debolezza o crescita rallentata nei cani giovani.

I cuccioli rappresentano un gruppo particolarmente importante perché alcuni parassiti possono essere acquisiti molto precocemente e influenzare maggiormente crescita e stato generale.

L'esame fecale è uno strumento fondamentale di controllo. Un singolo risultato negativo non esclude sempre ogni infezione parassitaria, perché l'eliminazione di uova o altre forme diagnostiche può essere intermittente.

Una buona igiene fa parte della prevenzione: rimozione rapida delle feci, pulizia delle aree di cibo e acqua e riduzione dell'accesso a fonti contaminate.

Alcuni parassiti intestinali hanno rilevanza anche per la salute umana; il loro controllo protegge quindi non soltanto il cane ma anche l'ambiente circostante.

Esami e strategie preventive devono essere adattati all'età, allo stile di vita, al contatto con altri animali, ai viaggi e al rischio parassitario locale. Non effettuare trattamenti casuali con prodotti o dosi sconosciuti.

Diarrea persistente, sangue nelle feci, vomito, disidratazione, forte debolezza o perdita di peso richiedono una valutazione veterinaria.

Questo materiale è educativo e non sostituisce l'esame fecale, la diagnosi veterinaria o un programma antiparassitario individuale.$bdy$)
),
matched as (
  select
    ci.id as content_item_id,
    s.language,
    s.translated_title,
    s.translated_body
  from source s
  join public.content_items ci
    on ci.section_key = 'knowledge'
   and ci.title = s.bg_title
   and ci.status = 'approved'
)
insert into public.knowledge_content_translations (
  content_item_id,
  language,
  title,
  body,
  created_at,
  updated_at
)
select
  content_item_id,
  language,
  translated_title,
  translated_body,
  now(),
  now()
from matched
on conflict (content_item_id, language)
do update set
  title = excluded.title,
  body = excluded.body,
  updated_at = now();
