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
    ('health_care', $ttl$Лайшманиоза: пясъчните мушици и скритият риск$ttl$, $bdy$Кучешката лайшманиоза най-често се свързва с Leishmania infantum и в Европа основният естествен вектор са пясъчните мушици. Рискът е по-висок в ендемични райони и при пътувания към такива места.

Заболяването може да протича дълго без ясни признаци. Когато се прояви, симптомите могат да включват отслабване, отпадналост, увеличени лимфни възли, кожни лезии, косопад, лющене, проблеми около очите, удължаване или деформация на ноктите, куцота, кръвотечение от носа и промени, свързани с бъбречно засягане.

Тези признаци не са специфични. Диагнозата се поставя от ветеринарен лекар чрез съчетаване на клиничната картина с лабораторни методи като серология, PCR и при определени случаи изследване на тъкани или клетки.

Профилактиката е насочена основно към намаляване на ухапванията от пясъчни мушици чрез подходяща ветеринарно препоръчана защита и управление на експозицията в рискови райони и сезони. При кучета, които живеят или пътуват в ендемични области, ветеринарят може да препоръча допълнителен скрининг и индивидуална профилактична стратегия.

Не приемайте кожни промени или отслабване автоматично за лайшманиоза. Сходни симптоми се срещат при много други заболявания.

Силна отпадналост, бързо отслабване, повръщане, значимо намаляване на апетита, кръвотечение, затруднено дишане или признаци на бъбречно влошаване изискват бърза ветеринарна оценка.

Този материал е образователен и не замества ветеринарно изследване, диагноза или индивидуална профилактична програма.$bdy$),
    ('health_care', $ttl$Бабезиоза: когато кърлежът уврежда кръвта$ttl$, $bdy$Бабезиозата е заболяване, причинено от протозойни паразити от рода Babesia, които могат да се предават чрез кърлежи и да увреждат червените кръвни клетки.

Тежестта варира според вида на паразита, имунния статус и общото здраве на кучето. Възможни симптоми са висока температура, силна отпадналост, липса на апетит, бледи или жълтеникави венци, ускорено дишане, слабост, тъмна или червеникава урина и понякога колапс.

Тъмната урина след контакт с кърлеж не трябва да се чака „да мине“. Разрушаването на червените кръвни клетки може да доведе до анемия и други сериозни усложнения.

Диагнозата може да включва пълна кръвна картина, микроскопско изследване, PCR и други лабораторни тестове според случая. Наличието на кърлеж само по себе си не доказва бабезиоза.

Основната превенция е надежден контрол на кърлежите, редовен оглед на кучето и бързо отстраняване на намерените паразити. При пътуване в райони с различен паразитен риск обсъдете профилактиката предварително с ветеринар.

При висока температура, много бледи или жълти венци, тъмна урина, тежка слабост, учестено дишане или колапс е необходима незабавна ветеринарна помощ.

Този материал е образователен и не замества лабораторна диагностика, ветеринарен преглед или индивидуална терапия.$bdy$),
    ('health_care', $ttl$Ерлихиоза: кърлежова инфекция с много лица$ttl$, $bdy$Ерлихиозата е кърлежово пренасяна инфекция, причинявана от бактерии от рода Ehrlichia. В Европа важен причинител при кучето е Ehrlichia canis.

Клиничната картина може да бъде различна. Възможни симптоми са температура, отпадналост, намален апетит, отслабване, увеличени лимфни възли, кръвотечения от носа, лесно образуване на синини, точковидни кръвоизливи по кожата или лигавиците, бледи венци и понякога очни или неврологични признаци.

При част от кучетата инфекцията може да премине през по-тих период, което прави лабораторната оценка важна при съмнение или рискова експозиция.

Диагнозата се основава на комбинация от клинични признаци, кръвна картина с особено внимание към тромбоцитите, серология и PCR според случая. Положителният тест за експозиция не винаги е равнозначен на активно клинично заболяване и трябва да се тълкува от ветеринар.

Най-важната профилактика е ефективната защита срещу кърлежи и ограничаването на експозицията в рискова среда. След разходки и престой навън кучето трябва да се оглежда внимателно.

Необясними кръвотечения, много бледи венци, силна слабост, висока температура или бързо влошаване изискват бърз ветеринарен преглед.

Този материал е образователен и не замества ветеринарна диагноза, лабораторно изследване или индивидуално лечение.$bdy$),
    ('health_care', $ttl$Анаплазмоза: температура, куцота и тромбоцити$ttl$, $bdy$Анаплазмозата е векторно пренасяна инфекция, причинявана от бактерии от рода Anaplasma. При кучетата в Европа значение имат най-вече Anaplasma phagocytophilum и Anaplasma platys.

Възможни симптоми са температура, отпадналост, намален апетит, болезненост, скованост, куцота, подуване на стави и понякога кръвотечения или синини, особено когато са засегнати тромбоцитите.

Някои кучета могат да бъдат инфектирани без ясно изразени симптоми. Затова диагнозата не трябва да се основава само на походката или наличието на кърлеж.

Ветеринарната оценка може да включва кръвна картина, изследване на тромбоцитите, серология и PCR. Резултатите се тълкуват заедно с клиничната картина и историята на експозиция.

Основната профилактика е надеждният контрол на кърлежите. Редовният оглед на кучето, бързото отстраняване на кърлежите и ограничаването на престоя в силно инфестирани места намаляват риска.

Температура, силна слабост, внезапна куцота с общо влошаване, необясними кръвотечения или много бледи венци са причина за ветеринарен преглед.

Този материал е образователен и не замества ветеринарна диагноза, лабораторно изследване или индивидуална терапия.$bdy$)
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
        owner_user_id, section_key, content_type, title, body, context_type,
        context_id, status, moderation_note, approved_by, approved_at,
        created_at, updated_at
      )
      values (
        admin_user, 'knowledge', 'article', item.material_title, item.material_body,
        item.category_key, null, 'approved',
        'USG Editorial · Vector-Borne Diseases · Knowledge Content Pack 07',
        admin_user, now(), now(), now()
      )
      returning id into existing_id;

      insert into public.content_audit_log (
        content_item_id, actor_user_id, actor_role, action,
        from_status, to_status, details
      )
      values (
        existing_id, admin_user, 'admin', 'editorial_seed_created',
        null, 'approved',
        jsonb_build_object(
          'source', 'USG Editorial Vector-Borne Diseases',
          'pack', 'KNOWLEDGE_CONTENT_PACK_07',
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
        moderation_note = 'USG Editorial · Vector-Borne Diseases · Knowledge Content Pack 07',
        approved_by = admin_user,
        approved_at = coalesce(approved_at, now()),
        updated_at = now()
      where id = existing_id;

      insert into public.content_audit_log (
        content_item_id, actor_user_id, actor_role, action,
        from_status, to_status, details
      )
      values (
        existing_id, admin_user, 'admin', 'editorial_seed_updated',
        'approved', 'approved',
        jsonb_build_object(
          'source', 'USG Editorial Vector-Borne Diseases',
          'pack', 'KNOWLEDGE_CONTENT_PACK_07',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Лайшманиоза: пясъчните мушици и скритият риск$bgt$, 'en', $ttl$Leishmaniosis: Sand Flies and the Hidden Risk$ttl$, $bdy$Canine leishmaniosis is most commonly associated with Leishmania infantum, and in Europe the principal natural vectors are sand flies. Risk is higher in endemic regions and in dogs that travel to those areas.

The disease may remain clinically silent for a long time. When signs develop, they can include weight loss, lethargy, enlarged lymph nodes, skin lesions, hair loss, scaling, problems around the eyes, abnormal nail growth, lameness, nosebleeds, and changes associated with kidney involvement.

These signs are not specific. Diagnosis is made by a veterinarian by combining the clinical picture with laboratory methods such as serology, PCR, and in selected cases examination of affected tissues or cells.

Prevention focuses mainly on reducing sand-fly bites through appropriate veterinarian-recommended protection and by managing exposure during high-risk seasons and in endemic areas. Dogs living in or travelling to endemic regions may also need additional screening and an individualized preventive strategy.

Do not assume that skin disease or weight loss automatically means leishmaniosis. Many other disorders can cause similar signs.

Marked lethargy, rapid weight loss, vomiting, major loss of appetite, bleeding, breathing difficulty, or signs of kidney deterioration require prompt veterinary assessment.

This material is educational and does not replace veterinary testing, diagnosis, or an individualized preventive program.$bdy$),
    ($bgt$Лайшманиоза: пясъчните мушици и скритият риск$bgt$, 'it', $ttl$Leishmaniosi: flebotomi e rischio nascosto$ttl$, $bdy$La leishmaniosi canina è associata soprattutto a Leishmania infantum e in Europa i principali vettori naturali sono i flebotomi. Il rischio è maggiore nelle aree endemiche e nei cani che viaggiano in tali zone.

La malattia può rimanere clinicamente silente a lungo. Quando compaiono segni, possono includere perdita di peso, abbattimento, linfonodi aumentati, lesioni cutanee, alopecia, desquamazione, problemi perioculari, crescita anomala delle unghie, zoppia, epistassi e alterazioni associate al coinvolgimento renale.

Questi segni non sono specifici. La diagnosi viene formulata dal veterinario combinando il quadro clinico con metodi di laboratorio come sierologia, PCR e, in casi selezionati, esame di tessuti o cellule interessate.

La prevenzione si concentra soprattutto sulla riduzione delle punture dei flebotomi mediante protezione adeguata raccomandata dal veterinario e gestione dell'esposizione nelle stagioni e nelle aree a rischio. I cani che vivono o viaggiano in aree endemiche possono richiedere anche screening aggiuntivi e una strategia preventiva individuale.

Non bisogna considerare automaticamente le lesioni cutanee o il dimagrimento come leishmaniosi. Molte altre malattie possono produrre segni simili.

Marcato abbattimento, rapido dimagrimento, vomito, forte riduzione dell'appetito, sanguinamento, difficoltà respiratoria o segni di peggioramento renale richiedono una rapida valutazione veterinaria.

Questo materiale è educativo e non sostituisce test veterinari, diagnosi o un programma preventivo individuale.$bdy$),
    ($bgt$Бабезиоза: когато кърлежът уврежда кръвта$bgt$, 'en', $ttl$Babesiosis: When a Tick-Borne Parasite Damages the Blood$ttl$, $bdy$Babesiosis is caused by protozoan parasites of the genus Babesia, which can be transmitted by ticks and can damage red blood cells.

Severity varies with the Babesia species, immune status, and the dog's overall health. Possible signs include fever, marked lethargy, loss of appetite, pale or yellowish gums, rapid breathing, weakness, dark or reddish urine, and sometimes collapse.

Dark urine after tick exposure should not simply be watched in the hope that it will pass. Destruction of red blood cells can lead to anemia and other serious complications.

Diagnosis may include a complete blood count, microscopic examination, PCR, and other laboratory testing as appropriate. Finding a tick does not by itself confirm babesiosis.

The main preventive strategy is reliable tick control, regular examination of the dog, and prompt removal of attached ticks. Before travel to regions with a different parasite risk, discuss prevention with a veterinarian.

High fever, very pale or yellow gums, dark urine, severe weakness, rapid breathing, or collapse requires immediate veterinary care.

This material is educational and does not replace laboratory diagnosis, veterinary examination, or individualized treatment.$bdy$),
    ($bgt$Бабезиоза: когато кърлежът уврежда кръвта$bgt$, 'it', $ttl$Babesiosi: quando un parassita trasmesso dalle zecche colpisce il sangue$ttl$, $bdy$La babesiosi è causata da protozoi del genere Babesia, che possono essere trasmessi dalle zecche e danneggiare i globuli rossi.

La gravità varia in base alla specie di Babesia, allo stato immunitario e alla salute generale del cane. I possibili segni comprendono febbre, forte abbattimento, perdita di appetito, gengive pallide o giallastre, respirazione accelerata, debolezza, urine scure o rossastre e talvolta collasso.

Le urine scure dopo esposizione alle zecche non devono essere semplicemente osservate aspettando che il problema passi. La distruzione dei globuli rossi può provocare anemia e altre complicazioni gravi.

La diagnosi può includere emocromo completo, esame microscopico, PCR e altri test di laboratorio secondo il caso. La presenza di una zecca, da sola, non conferma la babesiosi.

La principale strategia preventiva è un controllo affidabile delle zecche, l'ispezione regolare del cane e la rapida rimozione dei parassiti attaccati. Prima di viaggiare in aree con rischio parassitario differente, è opportuno discutere la prevenzione con il veterinario.

Febbre alta, gengive molto pallide o gialle, urine scure, grave debolezza, respirazione accelerata o collasso richiedono assistenza veterinaria immediata.

Questo materiale è educativo e non sostituisce diagnosi di laboratorio, visita veterinaria o trattamento individuale.$bdy$),
    ($bgt$Ерлихиоза: кърлежова инфекция с много лица$bgt$, 'en', $ttl$Ehrlichiosis: A Tick-Borne Infection with Many Faces$ttl$, $bdy$Ehrlichiosis is a tick-borne infection caused by bacteria of the genus Ehrlichia. In Europe, Ehrlichia canis is an important canine pathogen.

Clinical presentation can vary widely. Possible signs include fever, lethargy, reduced appetite, weight loss, enlarged lymph nodes, nosebleeds, easy bruising, pinpoint hemorrhages on the skin or mucous membranes, pale gums, and sometimes ocular or neurologic signs.

In some dogs, infection can pass through a quieter phase, making laboratory evaluation important when exposure or disease is suspected.

Diagnosis relies on a combination of clinical signs, a complete blood count with particular attention to platelets, serology, and PCR when appropriate. A positive exposure test is not always the same as active clinical disease and should be interpreted by a veterinarian.

The most important prevention is effective tick protection and reduction of exposure in high-risk environments. Dogs should be carefully checked after walks and outdoor activity.

Unexplained bleeding, very pale gums, marked weakness, high fever, or rapid deterioration requires prompt veterinary evaluation.

This material is educational and does not replace veterinary diagnosis, laboratory testing, or individualized treatment.$bdy$),
    ($bgt$Ерлихиоза: кърлежова инфекция с много лица$bgt$, 'it', $ttl$Ehrlichiosi: un'infezione da zecche con molti volti$ttl$, $bdy$L'ehrlichiosi è un'infezione trasmessa dalle zecche e causata da batteri del genere Ehrlichia. In Europa, Ehrlichia canis è un importante patogeno del cane.

Il quadro clinico può essere molto variabile. I possibili segni comprendono febbre, abbattimento, riduzione dell'appetito, perdita di peso, linfonodi aumentati, epistassi, facile formazione di ecchimosi, piccole emorragie puntiformi sulla cute o sulle mucose, gengive pallide e talvolta segni oculari o neurologici.

In alcuni cani l'infezione può attraversare una fase più silenziosa, rendendo importante la valutazione di laboratorio quando si sospetta esposizione o malattia.

La diagnosi si basa su una combinazione di segni clinici, emocromo completo con particolare attenzione alle piastrine, sierologia e PCR quando indicato. Un test positivo per esposizione non equivale sempre a malattia clinica attiva e deve essere interpretato dal veterinario.

La prevenzione più importante è una protezione efficace contro le zecche e la riduzione dell'esposizione negli ambienti a rischio. Il cane dovrebbe essere controllato attentamente dopo passeggiate e attività all'aperto.

Sanguinamenti inspiegabili, gengive molto pallide, marcata debolezza, febbre alta o rapido peggioramento richiedono una pronta valutazione veterinaria.

Questo materiale è educativo e non sostituisce diagnosi veterinaria, test di laboratorio o trattamento individuale.$bdy$),
    ($bgt$Анаплазмоза: температура, куцота и тромбоцити$bgt$, 'en', $ttl$Anaplasmosis: Fever, Lameness and Platelets$ttl$, $bdy$Anaplasmosis is a vector-borne infection caused by bacteria of the genus Anaplasma. In European dogs, Anaplasma phagocytophilum and Anaplasma platys are particularly relevant.

Possible signs include fever, lethargy, reduced appetite, pain, stiffness, lameness, swollen joints, and sometimes bleeding or bruising, especially when platelets are affected.

Some dogs can be infected without obvious clinical signs. Diagnosis should therefore not be based only on gait changes or on finding a tick.

Veterinary evaluation may include a complete blood count, platelet assessment, serology, and PCR. Results are interpreted together with the clinical picture and exposure history.

The main preventive strategy is reliable tick control. Regular inspection of the dog, prompt tick removal, and limiting exposure to heavily infested environments reduce risk.

Fever, marked weakness, sudden lameness with general deterioration, unexplained bleeding, or very pale gums are reasons for veterinary examination.

This material is educational and does not replace veterinary diagnosis, laboratory testing, or individualized treatment.$bdy$),
    ($bgt$Анаплазмоза: температура, куцота и тромбоцити$bgt$, 'it', $ttl$Anaplasmosi: febbre, zoppia e piastrine$ttl$, $bdy$L'anaplasmosi è un'infezione trasmessa da vettori e causata da batteri del genere Anaplasma. Nei cani europei sono particolarmente rilevanti Anaplasma phagocytophilum e Anaplasma platys.

I possibili segni comprendono febbre, abbattimento, riduzione dell'appetito, dolore, rigidità, zoppia, articolazioni gonfie e talvolta sanguinamenti o ecchimosi, soprattutto quando sono coinvolte le piastrine.

Alcuni cani possono essere infetti senza segni clinici evidenti. La diagnosi non dovrebbe quindi basarsi soltanto sui cambiamenti dell'andatura o sulla presenza di una zecca.

La valutazione veterinaria può includere emocromo completo, valutazione delle piastrine, sierologia e PCR. I risultati vengono interpretati insieme al quadro clinico e alla storia di esposizione.

La principale strategia preventiva è un controllo affidabile delle zecche. Ispezionare regolarmente il cane, rimuovere rapidamente le zecche e limitare l'esposizione ad ambienti fortemente infestati riduce il rischio.

Febbre, marcata debolezza, zoppia improvvisa associata a peggioramento generale, sanguinamenti inspiegabili o gengive molto pallide sono motivi per una visita veterinaria.

Questo materiale è educativo e non sostituisce diagnosi veterinaria, esami di laboratorio o trattamento individuale.$bdy$)
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
  content_item_id, language, title, body, created_at, updated_at
)
select
  content_item_id, language, translated_title, translated_body, now(), now()
from matched
on conflict (content_item_id, language)
do update set
  title = excluded.title,
  body = excluded.body,
  updated_at = now();
