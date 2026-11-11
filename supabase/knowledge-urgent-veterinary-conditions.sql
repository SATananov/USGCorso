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
    ('health_care', $ttl$Пиометра: спешност след разгонването$ttl$, $bdy$Пиометрата е сериозна инфекция на матката, която се развива при некастрирани женски кучета под влияние на хормоналните промени след разгонване. Може да прогресира бързо и да стане животозастрашаваща.

Често се появява няколко седмици след разгонването. Възможни симптоми са отпадналост, липса на апетит, повишена жажда, по-често уриниране, повръщане, температура, обезводняване и увеличаване или болезненост на корема.

При отворена пиометра може да има гнойно, кремаво, кафеникаво или кърваво течение от вулвата. При затворена пиометра течение може изобщо да няма. Това я прави особено коварна, защото инфекцията остава затворена в матката и състоянието може да се влоши много бързо.

Диагнозата се поставя от ветеринарен лекар чрез клиничен преглед, кръвни изследвания и образна диагностика, най-често ехография.

При женски, които няма да бъдат използвани за развъждане, кастрацията предотвратява пиометрата. При разплодни женски няма надеждна домашна профилактика, която да замени наблюдението и ветеринарния контрол. След всяко разгонване е важно собственикът да следи за промени в апетита, жаждата, общото състояние и наличието на течение.

Не използвайте хормонални препарати за контрол на разгонването без конкретна ветеринарна преценка.

Силна отпадналост, повръщане, подут корем, гнойно или кърваво течение, много повишена жажда, колапс или бързо влошаване са причина за незабавна ветеринарна помощ.

Този материал е образователен и не замества ветеринарна диагноза, ехографско изследване или лечение.$bdy$),
    ('health_care', $ttl$GDV: разширяване и усукване на стомаха$ttl$, $bdy$GDV — разширяване и усукване на стомаха — е животозастрашаваща спешност. Стомахът се разширява с газ и може да се завърти около оста си, което нарушава кръвоснабдяването и може бързо да доведе до шок.

Големите и дълбокогръди кучета са сред групите с повишен риск. Възрастта, фамилната предразположеност, много бързото хранене, големите единични порции и някои поведенчески или хранителни фактори могат да увеличат риска.

Типични предупредителни признаци са силно неспокойствие, обикаляне, слюноотделяне, болезнен или увеличен корем, учестено дишане и особено повтарящи се безрезултатни опити за повръщане.

При съмнение за GDV не се чака и не се опитва домашно лечение. Това е хирургична и реанимационна спешност и кучето трябва незабавно да бъде транспортирано до ветеринарна клиника.

Възможното намаляване на риска включва избягване на една огромна дневна порция, ограничаване на много бързото поглъщане на храната и разумно управление на активността около голямо хранене. Нито една от тези мерки не гарантира защита.

При кучета с по-висок индивидуален риск може да се обсъди профилактична гастропексия. Тя фиксира стомаха и значително намалява риска от усукване, но не означава, че кучето никога не може да получи стомашно разширяване.

Сухи напъни без повръщане, бързо увеличаващ се корем, тежко неспокойствие, слабост, бледи венци или колапс означават незабавна ветеринарна спешност.

Този материал е образователен и не замества спешна ветеринарна оценка.$bdy$),
    ('health_care', $ttl$Топлинен удар: минути могат да имат значение$ttl$, $bdy$Топлинният удар е спешно състояние, при което кучето не успява да разсее натрупаната телесна топлина. Може да доведе до увреждане на органи, нарушения в съсирването, неврологични проблеми и смърт.

Рискът се увеличава при горещо и влажно време, тежко физическо натоварване, лоша вентилация, престой в автомобил, липса на вода или сянка, затлъстяване и сърдечни или дихателни заболявания.

Предупредителни признаци са много силно задъхване, обилно слюноотделяне, гореща кожа, слабост, повръщане, диария, нестабилна походка, дезориентация, промяна в цвета на венците, колапс или гърчове.

При съмнение преместете кучето на прохладно и проветриво място и започнете постепенно охлаждане с хладна, не ледена вода. Въздушен поток от вентилатор или климатик може да помогне. Не потапяйте кучето в ледена вода и не отлагайте транспорта до ветеринар.

Превенцията включва разходки и упражнения в по-хладните части на деня, постоянен достъп до прясна вода и сянка, избягване на интензивно натоварване в горещо време и никога да не се оставя куче в затворен автомобил.

Голямо, мощно куче като Cane Corso може да продължи да работи или играе, дори когато вече се прегрява. Собственикът трябва да прекрати натоварването преди кучето да стигне до изтощение.

Колапс, гърчове, нарушена координация, тежко дишане, повръщане или силно променено съзнание изискват незабавна ветеринарна помощ, дори ако кучето изглежда по-добре след първоначално охлаждане.

Този материал е образователен и не замества спешна ветеринарна помощ.$bdy$),
    ('health_care', $ttl$Дистоция: кога раждането вече е спешност$ttl$, $bdy$Дистоция означава трудно раждане или невъзможност кученцето да бъде изродено без помощ. Причината може да бъде от майката, от плода или комбинация от двете.

Възможни причини са слаби или неефективни маточни контракции, изтощаване на матката, прекалено голям плод, неправилно положение на кученцето, стеснение на родовия канал или друго механично препятствие.

Предупредителни сигнали са силни и постоянни напъни без раждане на кученце, продължителен интервал между кученцата при наличие на контракции, видимо заседнало кученце, обилно кървене, силна слабост на майката или необичайно тъмно зелено и неприятно миришещо течение преди раждането на първото кученце.

По време на раждане собственикът трябва да записва часа на започване на активните контракции, часа на всяко родено кученце, интервалите между тях и общото състояние на майката. Това е ценна информация за ветеринаря.

Не давайте окситоцин, калций или други средства за стимулиране на раждането без ветеринарна оценка. Ако има механично препятствие, стимулирането на контракциите може да бъде опасно.

Превенцията започва още преди заплождането: здравна оценка на женската, разумен избор на партньор, контрол на телесното състояние и проследяване на бременността. В края на бременността ветеринарната оценка може да помогне за преценка на броя и състоянието на плодовете и за подготовка на план при усложнение.

Ако има силни контракции повече от около 30 минути без кученце, продължителна пауза с известни останали плодове, заседнало кученце, обилно кървене, колапс или очевидно влошаване на майката, потърсете ветеринарна помощ незабавно.

Този материал е образователен и не замества акушерска ветеринарна оценка или спешна помощ.$bdy$)
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
        'USG Editorial · Reproductive & Emergency · Knowledge Content Pack 08',
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
          'source', 'USG Editorial Reproductive & Emergency',
          'pack', 'KNOWLEDGE_CONTENT_PACK_08',
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
        moderation_note = 'USG Editorial · Reproductive & Emergency · Knowledge Content Pack 08',
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
          'source', 'USG Editorial Reproductive & Emergency',
          'pack', 'KNOWLEDGE_CONTENT_PACK_08',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Пиометра: спешност след разгонването$bgt$, 'en', $ttl$Pyometra: An Emergency After the Heat Cycle$ttl$, $bdy$Pyometra is a serious uterine infection that develops in unspayed female dogs under the influence of hormonal changes after a heat cycle. It can progress rapidly and become life-threatening.

It often develops several weeks after estrus. Possible signs include lethargy, loss of appetite, increased thirst, increased urination, vomiting, fever, dehydration, and abdominal enlargement or discomfort.

With open-cervix pyometra, purulent, creamy, brownish, or blood-tinged vaginal discharge may be visible. With closed-cervix pyometra, there may be no discharge at all. This makes the condition particularly dangerous because infection remains trapped in the uterus and deterioration can be rapid.

Diagnosis is made by a veterinarian using clinical examination, blood testing, and diagnostic imaging, most commonly ultrasound.

For females that will not be used for breeding, spaying prevents pyometra. In breeding females, there is no reliable home preventive measure that replaces observation and veterinary care. After each heat cycle, owners should watch for changes in appetite, thirst, general condition, and vaginal discharge.

Do not use hormonal products to control heat cycles without specific veterinary guidance.

Marked lethargy, vomiting, abdominal enlargement, purulent or bloody discharge, greatly increased thirst, collapse, or rapid deterioration requires immediate veterinary care.

This material is educational and does not replace veterinary diagnosis, ultrasound examination, or treatment.$bdy$),
    ($bgt$Пиометра: спешност след разгонването$bgt$, 'it', $ttl$Piometra: un'emergenza dopo il calore$ttl$, $bdy$La piometra è una grave infezione dell'utero che si sviluppa nelle femmine non sterilizzate sotto l'influenza dei cambiamenti ormonali successivi al calore. Può progredire rapidamente e diventare pericolosa per la vita.

Si manifesta spesso alcune settimane dopo l'estro. I possibili segni comprendono abbattimento, perdita di appetito, aumento della sete, aumento della minzione, vomito, febbre, disidratazione e aumento di volume o dolorabilità dell'addome.

Nella piometra a cervice aperta può essere presente uno scolo vaginale purulento, cremoso, brunastro o striato di sangue. Nella piometra a cervice chiusa può non esserci alcuno scolo. Questo rende la condizione particolarmente insidiosa perché l'infezione rimane confinata nell'utero e il peggioramento può essere rapido.

La diagnosi viene effettuata dal veterinario mediante visita clinica, esami del sangue e diagnostica per immagini, soprattutto ecografia.

Nelle femmine che non saranno utilizzate per la riproduzione, la sterilizzazione previene la piometra. Nelle femmine riproduttrici non esiste una misura preventiva domestica affidabile che sostituisca osservazione e controllo veterinario. Dopo ogni calore è importante osservare appetito, sete, condizioni generali ed eventuali perdite vaginali.

Non utilizzare prodotti ormonali per controllare il calore senza una specifica indicazione veterinaria.

Forte abbattimento, vomito, addome aumentato di volume, perdite purulente o sanguinolente, sete molto aumentata, collasso o rapido peggioramento richiedono assistenza veterinaria immediata.

Questo materiale è educativo e non sostituisce diagnosi veterinaria, esame ecografico o trattamento.$bdy$),
    ($bgt$GDV: разширяване и усукване на стомаха$bgt$, 'en', $ttl$GDV: Gastric Dilatation and Volvulus$ttl$, $bdy$GDV — gastric dilatation and volvulus — is a life-threatening emergency. The stomach becomes distended with gas and may rotate on its axis, disrupting blood flow and potentially causing shock very quickly.

Large and deep-chested dogs are among the groups at increased risk. Age, family history, very rapid eating, large single meals, and certain behavioral or feeding factors can increase risk.

Typical warning signs include marked restlessness, pacing, drooling, a painful or enlarged abdomen, rapid breathing, and especially repeated unproductive attempts to vomit.

If GDV is suspected, do not wait and do not attempt home treatment. It is a surgical and critical-care emergency, and the dog should be transported to a veterinary hospital immediately.

Possible risk-reduction measures include avoiding one very large daily meal, reducing very rapid food intake, and sensibly managing vigorous activity around large meals. None of these measures guarantees prevention.

For dogs with higher individual risk, preventive gastropexy can be discussed with a veterinarian. It fixes the stomach in position and greatly reduces the risk of volvulus, but it does not mean that gastric dilatation can never occur.

Repeated dry retching, a rapidly enlarging abdomen, severe restlessness, weakness, pale gums, or collapse is an immediate veterinary emergency.

This material is educational and does not replace emergency veterinary assessment.$bdy$),
    ($bgt$GDV: разширяване и усукване на стомаха$bgt$, 'it', $ttl$GDV: dilatazione e torsione gastrica$ttl$, $bdy$La GDV — dilatazione e torsione gastrica — è un'emergenza potenzialmente letale. Lo stomaco si distende con gas e può ruotare sul proprio asse, compromettendo il flusso sanguigno e provocando rapidamente shock.

I cani di taglia grande e con torace profondo rientrano tra i gruppi a maggior rischio. Età, familiarità, ingestione molto rapida del cibo, pasti singoli molto abbondanti e alcuni fattori comportamentali o alimentari possono aumentare il rischio.

I segnali tipici comprendono forte irrequietezza, camminare avanti e indietro, salivazione, addome doloroso o aumentato di volume, respirazione accelerata e soprattutto ripetuti tentativi improduttivi di vomitare.

Se si sospetta una GDV, non bisogna aspettare né tentare cure domestiche. È un'emergenza chirurgica e di terapia intensiva e il cane deve essere trasportato immediatamente in una struttura veterinaria.

Le possibili misure di riduzione del rischio comprendono evitare un unico pasto giornaliero molto abbondante, limitare l'ingestione troppo rapida del cibo e gestire con buon senso l'attività intensa intorno ai pasti abbondanti. Nessuna di queste misure garantisce la prevenzione.

Nei cani con rischio individuale elevato si può discutere con il veterinario una gastropessi preventiva. Essa fissa lo stomaco e riduce fortemente il rischio di torsione, ma non significa che una dilatazione gastrica non possa mai verificarsi.

Conati ripetuti senza vomito, addome che aumenta rapidamente di volume, grave irrequietezza, debolezza, gengive pallide o collasso costituiscono un'emergenza veterinaria immediata.

Questo materiale è educativo e non sostituisce una valutazione veterinaria d'urgenza.$bdy$),
    ($bgt$Топлинен удар: минути могат да имат значение$bgt$, 'en', $ttl$Heat Stroke: Minutes Can Matter$ttl$, $bdy$Heat stroke is an emergency in which a dog can no longer dissipate accumulated body heat effectively. It can lead to organ damage, clotting abnormalities, neurologic injury, and death.

Risk increases with hot and humid weather, strenuous activity, poor ventilation, confinement in a vehicle, lack of water or shade, obesity, and underlying heart or respiratory disease.

Warning signs include extreme panting, heavy drooling, hot skin, weakness, vomiting, diarrhea, unsteady movement, disorientation, abnormal gum color, collapse, or seizures.

If heat stroke is suspected, move the dog to a cool, well-ventilated place and begin gradual cooling with cool, not ice-cold, water. Airflow from a fan or air conditioning can help. Do not immerse the dog in ice water, and do not delay transport to a veterinarian.

Prevention includes exercising during cooler parts of the day, providing continuous access to fresh water and shade, avoiding intense activity in hot conditions, and never leaving a dog in a closed vehicle.

A large, powerful dog such as a Cane Corso may continue working or playing even while overheating. The owner should stop activity before the dog reaches exhaustion.

Collapse, seizures, loss of coordination, severe breathing difficulty, vomiting, or major alteration in consciousness requires immediate veterinary care, even if the dog appears better after initial cooling.

This material is educational and does not replace emergency veterinary care.$bdy$),
    ($bgt$Топлинен удар: минути могат да имат значение$bgt$, 'it', $ttl$Colpo di calore: i minuti possono fare la differenza$ttl$, $bdy$Il colpo di calore è un'emergenza in cui il cane non riesce più a disperdere efficacemente il calore corporeo accumulato. Può provocare danni agli organi, disturbi della coagulazione, danni neurologici e morte.

Il rischio aumenta con clima caldo e umido, attività fisica intensa, scarsa ventilazione, permanenza in automobile, mancanza di acqua o ombra, obesità e malattie cardiache o respiratorie.

I segnali di allarme comprendono ansimare estremamente intenso, salivazione abbondante, cute calda, debolezza, vomito, diarrea, andatura instabile, disorientamento, colore anomalo delle gengive, collasso o convulsioni.

Se si sospetta un colpo di calore, spostare il cane in un luogo fresco e ben ventilato e iniziare un raffreddamento graduale con acqua fresca, non ghiacciata. Il flusso d'aria di un ventilatore o del condizionatore può aiutare. Non immergere il cane in acqua ghiacciata e non ritardare il trasporto dal veterinario.

La prevenzione comprende attività nelle ore più fresche, accesso continuo ad acqua fresca e ombra, evitare esercizio intenso con il caldo e non lasciare mai un cane in un veicolo chiuso.

Un cane grande e potente come il Cane Corso può continuare a lavorare o giocare anche mentre si sta surriscaldando. Il proprietario deve interrompere l'attività prima che il cane arrivi all'esaurimento.

Collasso, convulsioni, perdita di coordinazione, grave difficoltà respiratoria, vomito o marcata alterazione dello stato di coscienza richiedono assistenza veterinaria immediata, anche se il cane sembra migliorare dopo il raffreddamento iniziale.

Questo materiale è educativo e non sostituisce l'assistenza veterinaria d'urgenza.$bdy$),
    ($bgt$Дистоция: кога раждането вече е спешност$bgt$, 'en', $ttl$Dystocia: When Whelping Becomes an Emergency$ttl$, $bdy$Dystocia means difficult birth or the inability to deliver a puppy without assistance. The cause may be maternal, fetal, or a combination of both.

Possible causes include weak or ineffective uterine contractions, uterine exhaustion, an oversized fetus, abnormal fetal position, narrowing of the birth canal, or another mechanical obstruction.

Warning signs include strong persistent straining without delivery of a puppy, a prolonged interval between puppies when contractions are present, a visibly trapped puppy, heavy bleeding, marked weakness of the mother, or abnormal dark-green and foul-smelling discharge before the first puppy is delivered.

During whelping, the owner should record when active contractions begin, the time each puppy is born, the intervals between puppies, and the mother's general condition. This is valuable information for the veterinarian.

Do not give oxytocin, calcium, or other labor-stimulating agents without veterinary assessment. If there is a mechanical obstruction, stimulating contractions can be dangerous.

Prevention begins before breeding: health evaluation of the female, sensible mate selection, body-condition management, and pregnancy monitoring. Near the end of pregnancy, veterinary assessment can help estimate fetal number and condition and prepare a plan in case complications develop.

If there are strong contractions for more than about 30 minutes without delivery of a puppy, a prolonged pause when more fetuses are known to remain, a trapped puppy, heavy bleeding, collapse, or obvious deterioration of the mother, seek veterinary help immediately.

This material is educational and does not replace obstetric veterinary assessment or emergency care.$bdy$),
    ($bgt$Дистоция: кога раждането вече е спешност$bgt$, 'it', $ttl$Distocia: quando il parto diventa un'emergenza$ttl$, $bdy$La distocia indica un parto difficile o l'impossibilità di espellere un cucciolo senza assistenza. La causa può essere materna, fetale o una combinazione di entrambe.

Le possibili cause comprendono contrazioni uterine deboli o inefficaci, esaurimento dell'utero, feto troppo grande, posizione fetale anomala, restringimento del canale del parto o un'altra ostruzione meccanica.

I segnali di allarme comprendono forti spinte persistenti senza nascita di un cucciolo, un intervallo prolungato tra i cuccioli in presenza di contrazioni, un cucciolo visibilmente bloccato, emorragia abbondante, marcata debolezza della madre o una secrezione anomala verde scuro e maleodorante prima della nascita del primo cucciolo.

Durante il parto il proprietario dovrebbe annotare l'ora di inizio delle contrazioni attive, l'ora di nascita di ogni cucciolo, gli intervalli tra i cuccioli e le condizioni generali della madre. Sono informazioni preziose per il veterinario.

Non somministrare ossitocina, calcio o altri prodotti per stimolare il parto senza valutazione veterinaria. Se esiste un'ostruzione meccanica, stimolare le contrazioni può essere pericoloso.

La prevenzione inizia prima dell'accoppiamento: valutazione sanitaria della femmina, scelta ragionata del partner, controllo della condizione corporea e monitoraggio della gravidanza. Verso la fine della gestazione, la valutazione veterinaria può aiutare a stimare numero e condizioni dei feti e a preparare un piano in caso di complicazioni.

Se ci sono forti contrazioni per oltre circa 30 minuti senza la nascita di un cucciolo, una pausa prolungata quando si sa che restano altri feti, un cucciolo bloccato, forte emorragia, collasso o evidente peggioramento della madre, è necessario richiedere immediatamente assistenza veterinaria.

Questo materiale è educativo e non sostituisce una valutazione ostetrica veterinaria o l'assistenza d'urgenza.$bdy$)
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
