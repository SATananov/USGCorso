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
    ('health_care', $ttl$Епилепсия и гърчове: причини, видове и действия$ttl$, $bdy$Гърчът е внезапен епизод на необичайна електрическа активност в мозъка. Епилепсия обикновено означава предразположение към повтарящи се непровокирани гърчове, като класическата дефиниция включва два или повече непровокирани пристъпа, разделени с повече от 24 часа.

Не всеки гърч означава епилепсия. Причините могат да бъдат идиопатична или вероятно наследствена епилепсия, структурно заболяване на мозъка като възпаление, травма, вродена аномалия или тумор, както и реактивни гърчове при токсини, ниска кръвна захар, електролитни нарушения, чернодробно заболяване и други метаболитни проблеми.

Гърчовете могат да бъдат генерализирани, когато е засегната голяма част от мозъка и кучето губи съзнание с двустранни двигателни прояви, или фокални, когато признаците започват от ограничена мозъчна област. Фокалният гърч може да изглежда като потрепване на част от лицето, необичайни движения, внезапно поведение или автономни признаци и понякога да премине в генерализиран.

Преди пристъпа някои кучета показват неспокойствие или промяна в поведението. След него могат временно да бъдат объркани, нестабилни, гладни, неспокойни или с нарушено зрение. Воденето на дневник с дата, продължителност, описание и евентуален видеозапис е много полезно за ветеринаря.

Диагностиката започва с установяване дали епизодът наистина е гърч и след това с търсене на причината. Могат да бъдат нужни кръвни изследвания, урина, оценка за токсини и инфекции, а при определени случаи MRI на мозъка и изследване на цереброспинална течност.

Няма универсален начин да се предотврати идиопатичната епилепсия. Възможното намаляване на риска включва избягване на токсини, контрол на метаболитни заболявания, проследяване на индивидуални тригери и отговорна селекция при доказана или подозирана наследствена форма. Не съществува добавка или хранителен режим, който надеждно да гарантира предотвратяване на епилепсията.

По време на гърч не слагайте ръце или предмети в устата на кучето. Освободете пространството около него от опасни предмети, намалете светлината и шума и измерете продължителността.

Гърч, който продължава около 5 минути или повече, серия от пристъпи без пълно възстановяване между тях, тежко затруднено дишане, травма или първи тежък пристъп изискват спешна ветеринарна помощ.

Този материал е образователен и не замества неврологичен преглед, ветеринарна диагноза или индивидуален лечебен план.$bdy$),
    ('health_care', $ttl$Cluster seizures и status epilepticus: когато гърчовете са спешност$ttl$, $bdy$Cluster seizures означава повече от един гърч в кратък период, обикновено в рамките на 24 часа. Status epilepticus е продължителен гърч или повтарящи се гърчове без пълно възстановяване на съзнанието между тях.

Това са спешни неврологични състояния. Продължителната гърчова активност може да доведе до прегряване, нарушения в дишането и кръвообращението, метаболитни промени, мозъчно увреждане и смърт.

Собственикът трябва да засича времето от началото на гърча. Продължителност около 5 минути е критичен праг за спешна реакция. При повтарящи се пристъпи за кратко време също не трябва да се чака следващият.

По време на пристъпа обезопасете пространството около кучето, отдалечете го от стълби, вода и остри предмети, намалете светлината и шума и не слагайте нищо в устата.

Ако ветеринарят предварително е изготвил домашен emergency plan за конкретното куче, следвайте само него. Не използвайте лекарства от друго животно, човешки медикаменти или произволни дози.

Превенцията на cluster seizures зависи от причината и от контрола на основното епилептично заболяване. При вече диагностицирано куче редовното даване на предписаните лекарства, избягването на пропуски и воденето на seizure diary могат да помогнат за по-добър контрол и ранно разпознаване на промяна в модела.

Повече от един гърч за ден, гърч около 5 минути или повече, непълно възстановяване между пристъпите, продължителна дезориентация, прегряване, травма или затруднено дишане означават спешна ветеринарна помощ.

Този материал е образователен и не замества индивидуален emergency protocol, изготвен от ветеринарен лекар.$bdy$),
    ('health_care', $ttl$NCL1 при Cane Corso: наследствено невродегенеративно заболяване$ttl$, $bdy$NCL1 — neuronal ceroid lipofuscinosis type 1 — е наследствено невродегенеративно заболяване, описано при Cane Corso. Формата при породата е свързана с мутация в гена PPT1 и се унаследява автозомно-рецесивно.

При засегнатите Cane Corso признаците могат да започнат още около 8-месечна възраст. Описани са влошаване на зрението при слаба светлина, което може да прогресира към слепота, както и постепенно засилваща се атаксия — нарушена координация и нестабилна походка.

С напредване на заболяването кучето може да се спъва, да кръстосва крайниците, да има затруднения при скачане, качване или слизане по стълби и по-късно често да пада. При някои засегнати кучета могат да се появят и гърчове.

NCL1 е прогресивно заболяване. Симптомите могат да наподобяват други неврологични проблеми, затова клиничните признаци сами по себе си не са достатъчни за сигурна диагноза.

За Cane Corso съществува DNA тест за NCL1. Това позволява развъдните кучета да бъдат определени като clear, carrier или affected според конкретния тест.

Тъй като унаследяването е автозомно-рецесивно, основната превенция е генетичният скрининг преди развъждане и планиране на комбинации, които не могат да произведат засегнати кученца. Носителят не е равнозначен на болно куче, но статусът трябва да бъде известен и съчетанията да бъдат планирани отговорно.

Прогресираща загуба на координация, зрителни промени, чести падания или гърчове при младо Cane Corso изискват неврологична ветеринарна оценка.

Този материал е образователен и не замества DNA тест, неврологичен преглед или ветеринарна диагноза.$bdy$),
    ('health_care', $ttl$DSRA при Cane Corso: зъби, скелет и зрение$ttl$, $bdy$DSRA — Dental-Skeletal-Retinal Anomaly — е наследствено заболяване, описано специално при Cane Corso. То засяга развитието на зъбите, скелета и ретината.

При засегнатите кучета зъбите могат да бъдат необичайно крехки, обезцветени или полупрозрачни. Скелетното развитие също може да бъде нарушено, а прогресивната дегенерация на ретината може да доведе до влошаване и загуба на зрението.

Тези промени не трябва да се разглеждат като отделни несвързани проблеми. Комбинацията от аномалии в зъбите, растежа и зрението при младо Cane Corso е причина да се обсъди DSRA с ветеринарен лекар и да се използва специфичен генетичен тест.

DSRA се унаследява автозомно-рецесивно. DNA тестът може да класифицира кучето като clear, carrier или affected.

Clear куче не носи тестваната мутация. Carrier куче носи едно копие и по наличните данни не развива клиничните признаци на заболяването, но може да предаде мутацията. Affected куче носи две копия на мутацията и е генетично засегнато.

Основната превенция е предразвъдният DNA скрининг и отговорното планиране на съчетанията. Носителите не трябва автоматично да се изключват без оценка на генетичното разнообразие, но не трябва да се съчетават по начин, който може да произведе засегнати кученца.

Чупливи или необичайно оцветени зъби, нетипично скелетно развитие или прогресираща загуба на зрение при младо Cane Corso изискват ветеринарна оценка.

Този материал е образователен и не замества DNA тест, офталмологичен, стоматологичен или ортопедичен ветеринарен преглед.$bdy$)
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
        'USG Editorial · Epilepsy & Neurology · Knowledge Content Pack 10',
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
          'source', 'USG Editorial Epilepsy & Neurology',
          'pack', 'KNOWLEDGE_CONTENT_PACK_10',
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
        moderation_note = 'USG Editorial · Epilepsy & Neurology · Knowledge Content Pack 10',
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
          'source', 'USG Editorial Epilepsy & Neurology',
          'pack', 'KNOWLEDGE_CONTENT_PACK_10',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Епилепсия и гърчове: причини, видове и действия$bgt$, 'en', $ttl$Epilepsy and Seizures: Causes, Types and What to Do$ttl$, $bdy$A seizure is a sudden episode of abnormal electrical activity in the brain. Epilepsy generally means a predisposition to recurrent unprovoked seizures, with the classic definition including two or more unprovoked seizures separated by more than 24 hours.

Not every seizure means epilepsy. Causes can include idiopathic or likely inherited epilepsy, structural brain disease such as inflammation, trauma, congenital abnormality, or tumor, as well as reactive seizures caused by toxins, low blood glucose, electrolyte abnormalities, liver disease, and other metabolic disturbances.

Seizures can be generalized, involving much of the brain with loss of consciousness and bilateral motor activity, or focal, beginning in a limited brain region. A focal seizure may appear as twitching of part of the face, unusual movements, sudden behavioral changes, or autonomic signs, and it can sometimes progress to a generalized seizure.

Before a seizure, some dogs show restlessness or behavioral change. Afterwards, they may temporarily be confused, unsteady, hungry, restless, or visually impaired. Keeping a seizure diary with date, duration, description, and, when safe, video is extremely useful for the veterinarian.

Diagnosis begins by determining whether the event was truly a seizure and then identifying the underlying cause. Blood testing, urinalysis, evaluation for toxins and infections, and in selected cases brain MRI and cerebrospinal fluid analysis may be needed.

There is no universal way to prevent idiopathic epilepsy. Risk reduction may include avoiding toxins, controlling metabolic disease, tracking individual triggers, and responsible breeding when an inherited form is proven or strongly suspected. No supplement or diet can reliably guarantee prevention of epilepsy.

During a seizure, do not put hands or objects into the dog's mouth. Clear dangerous objects from the area, reduce light and noise, and time the episode.

A seizure lasting around 5 minutes or longer, repeated seizures without full recovery between them, severe breathing difficulty, trauma, or a first severe seizure requires emergency veterinary care.

This material is educational and does not replace neurologic examination, veterinary diagnosis, or an individualized treatment plan.$bdy$),
    ($bgt$Епилепсия и гърчове: причини, видове и действия$bgt$, 'it', $ttl$Epilessia e crisi convulsive: cause, tipi e cosa fare$ttl$, $bdy$Una crisi convulsiva è un episodio improvviso di attività elettrica anomala nel cervello. L'epilessia indica generalmente una predisposizione a crisi non provocate ricorrenti; la definizione classica comprende due o più crisi non provocate separate da oltre 24 ore.

Non ogni crisi significa epilessia. Le cause possono comprendere epilessia idiopatica o probabilmente ereditaria, malattie strutturali del cervello come infiammazione, trauma, anomalie congenite o tumori, oltre a crisi reattive dovute a tossine, ipoglicemia, alterazioni elettrolitiche, malattie epatiche e altri disturbi metabolici.

Le crisi possono essere generalizzate, quando coinvolgono gran parte del cervello con perdita di coscienza e attività motoria bilaterale, oppure focali, quando iniziano in una regione cerebrale limitata. Una crisi focale può manifestarsi con contrazioni di una parte del volto, movimenti insoliti, improvvisi cambiamenti comportamentali o segni autonomici e talvolta può evolvere in una crisi generalizzata.

Prima della crisi alcuni cani mostrano irrequietezza o cambiamenti del comportamento. Dopo possono essere temporaneamente confusi, instabili, affamati, irrequieti o con alterazioni visive. Tenere un diario con data, durata, descrizione ed eventualmente un video, quando è sicuro farlo, è molto utile per il veterinario.

La diagnosi inizia stabilendo se l'episodio sia realmente una crisi epilettica e successivamente ricercandone la causa. Possono essere necessari esami del sangue, urine, valutazione di tossine e infezioni e, in alcuni casi, MRI cerebrale e analisi del liquido cerebrospinale.

Non esiste un metodo universale per prevenire l'epilessia idiopatica. La riduzione del rischio può includere evitare tossine, controllare malattie metaboliche, monitorare i trigger individuali e una selezione responsabile quando una forma ereditaria è dimostrata o fortemente sospettata. Nessun integratore o dieta garantisce in modo affidabile la prevenzione dell'epilessia.

Durante una crisi non mettere mani o oggetti nella bocca del cane. Liberare l'area da oggetti pericolosi, ridurre luce e rumore e misurare la durata dell'episodio.

Una crisi che dura circa 5 minuti o più, crisi ripetute senza completo recupero tra gli episodi, grave difficoltà respiratoria, trauma o una prima crisi grave richiedono assistenza veterinaria d'urgenza.

Questo materiale è educativo e non sostituisce visita neurologica, diagnosi veterinaria o piano terapeutico individuale.$bdy$),
    ($bgt$Cluster seizures и status epilepticus: когато гърчовете са спешност$bgt$, 'en', $ttl$Cluster Seizures and Status Epilepticus: When Seizures Are an Emergency$ttl$, $bdy$Cluster seizures means more than one seizure occurring within a short period, commonly within 24 hours. Status epilepticus is a prolonged seizure or repeated seizures without full recovery of consciousness between them.

These are neurologic emergencies. Prolonged seizure activity can lead to hyperthermia, respiratory and circulatory compromise, metabolic disturbances, brain injury, and death.

The owner should time the seizure from its onset. A duration of around 5 minutes is a critical threshold for emergency action. Repeated seizures over a short period also require urgent response rather than waiting for another episode.

During the seizure, make the area safe, keep the dog away from stairs, water, and sharp objects, reduce light and noise, and put nothing into the mouth.

If a veterinarian has already created a home emergency plan for that individual dog, follow only that plan. Do not use medication belonging to another animal, human drugs, or improvised doses.

Preventing cluster seizures depends on the underlying cause and control of the primary seizure disorder. In a diagnosed dog, giving prescribed medication consistently, avoiding missed doses, and keeping a seizure diary can support better control and earlier recognition of changes in the seizure pattern.

More than one seizure in a day, a seizure lasting around 5 minutes or longer, incomplete recovery between episodes, prolonged disorientation, overheating, trauma, or breathing difficulty requires emergency veterinary care.

This material is educational and does not replace an individualized emergency protocol prepared by a veterinarian.$bdy$),
    ($bgt$Cluster seizures и status epilepticus: когато гърчовете са спешност$bgt$, 'it', $ttl$Crisi a grappolo e status epilepticus: quando le crisi sono un'emergenza$ttl$, $bdy$Le crisi a grappolo indicano più di una crisi in un breve periodo, comunemente entro 24 ore. Lo status epilepticus è una crisi prolungata oppure crisi ripetute senza completo recupero della coscienza tra gli episodi.

Si tratta di emergenze neurologiche. Un'attività convulsiva prolungata può provocare ipertermia, compromissione respiratoria e circolatoria, alterazioni metaboliche, danni cerebrali e morte.

Il proprietario dovrebbe misurare il tempo dall'inizio della crisi. Una durata di circa 5 minuti rappresenta una soglia critica per l'intervento d'urgenza. Anche crisi ripetute in un breve periodo richiedono una risposta urgente senza attendere un altro episodio.

Durante la crisi rendere sicura l'area, tenere il cane lontano da scale, acqua e oggetti appuntiti, ridurre luce e rumore e non mettere nulla nella bocca.

Se il veterinario ha già preparato un piano d'emergenza domiciliare per quel cane, seguire esclusivamente quel piano. Non utilizzare farmaci appartenenti ad altri animali, medicinali umani o dosi improvvisate.

La prevenzione delle crisi a grappolo dipende dalla causa sottostante e dal controllo del disturbo epilettico primario. In un cane già diagnosticato, somministrare regolarmente i farmaci prescritti, evitare dosi saltate e mantenere un diario delle crisi può favorire un migliore controllo e il riconoscimento precoce di cambiamenti nel pattern.

Più di una crisi in un giorno, una crisi della durata di circa 5 minuti o più, recupero incompleto tra gli episodi, disorientamento prolungato, surriscaldamento, trauma o difficoltà respiratoria richiedono assistenza veterinaria d'urgenza.

Questo materiale è educativo e non sostituisce un protocollo d'emergenza individuale preparato dal veterinario.$bdy$),
    ($bgt$NCL1 при Cane Corso: наследствено невродегенеративно заболяване$bgt$, 'en', $ttl$NCL1 in Cane Corso: An Inherited Neurodegenerative Disease$ttl$, $bdy$NCL1 — neuronal ceroid lipofuscinosis type 1 — is an inherited neurodegenerative disease described in the Cane Corso. The breed-specific form is associated with a mutation in the PPT1 gene and is inherited as an autosomal recessive trait.

In affected Cane Corsos, signs can begin at around 8 months of age. Reported abnormalities include impaired vision in dim light that may progress toward blindness and progressively worsening ataxia — loss of coordination and an unstable gait.

As the disease advances, a dog may stumble, cross its limbs, have difficulty jumping or negotiating stairs, and later fall frequently. Some affected dogs may also develop seizures.

NCL1 is progressive. Its signs can resemble other neurologic disorders, so clinical appearance alone is not enough for a definitive diagnosis.

A DNA test for NCL1 is available for the Cane Corso. This allows breeding dogs to be classified as clear, carrier, or affected according to the specific test.

Because inheritance is autosomal recessive, the primary preventive strategy is genetic screening before breeding and planning combinations that cannot produce affected puppies. A carrier is not the same as a clinically affected dog, but carrier status should be known and matings planned responsibly.

Progressive loss of coordination, visual changes, frequent falling, or seizures in a young Cane Corso requires veterinary neurologic evaluation.

This material is educational and does not replace DNA testing, neurologic examination, or veterinary diagnosis.$bdy$),
    ($bgt$NCL1 при Cane Corso: наследствено невродегенеративно заболяване$bgt$, 'it', $ttl$NCL1 nel Cane Corso: una malattia neurodegenerativa ereditaria$ttl$, $bdy$NCL1 — neuronal ceroid lipofuscinosis type 1 — è una malattia neurodegenerativa ereditaria descritta nel Cane Corso. La forma specifica della razza è associata a una mutazione del gene PPT1 ed è ereditata come carattere autosomico recessivo.

Nei Cane Corso affetti, i segni possono iniziare intorno agli 8 mesi di età. Sono stati descritti deficit visivi in condizioni di scarsa illuminazione, che possono progredire verso la cecità, e atassia progressivamente più grave, cioè perdita di coordinazione e andatura instabile.

Con il progredire della malattia il cane può inciampare, incrociare gli arti, avere difficoltà a saltare o affrontare le scale e, nelle fasi avanzate, cadere frequentemente. In alcuni soggetti possono comparire anche crisi convulsive.

NCL1 è una malattia progressiva. I segni possono assomigliare ad altri disturbi neurologici, quindi l'aspetto clinico da solo non è sufficiente per una diagnosi definitiva.

Per il Cane Corso è disponibile un test DNA per NCL1. Questo consente di classificare i riproduttori come clear, carrier o affected secondo il test specifico.

Poiché l'ereditarietà è autosomica recessiva, la principale strategia preventiva è lo screening genetico prima della riproduzione e la pianificazione di accoppiamenti che non possano produrre cuccioli affetti. Un portatore non equivale a un cane clinicamente malato, ma lo status deve essere noto e gli accoppiamenti pianificati responsabilmente.

Perdita progressiva di coordinazione, alterazioni visive, cadute frequenti o crisi convulsive in un giovane Cane Corso richiedono una valutazione neurologica veterinaria.

Questo materiale è educativo e non sostituisce test DNA, visita neurologica o diagnosi veterinaria.$bdy$),
    ($bgt$DSRA при Cane Corso: зъби, скелет и зрение$bgt$, 'en', $ttl$DSRA in Cane Corso: Teeth, Skeleton and Vision$ttl$, $bdy$DSRA — Dental-Skeletal-Retinal Anomaly — is an inherited disorder described specifically in the Cane Corso. It affects development of the teeth, skeleton, and retina.

Affected dogs may have teeth that are unusually brittle, discolored, or translucent. Skeletal development can also be abnormal, while progressive retinal degeneration may lead to worsening vision and eventual vision loss.

These abnormalities should not be treated as unrelated problems. A combination of dental, growth, and visual abnormalities in a young Cane Corso is a reason to discuss DSRA with a veterinarian and use the specific genetic test.

DSRA is inherited as an autosomal recessive trait. DNA testing can classify a dog as clear, carrier, or affected.

A clear dog does not carry the tested mutation. A carrier has one copy and, according to current evidence, does not develop the clinical disease, but can pass the mutation to offspring. An affected dog carries two copies of the mutation and is genetically affected.

The primary preventive strategy is pre-breeding DNA screening and responsible mating design. Carriers should not automatically be removed without considering genetic diversity, but they should not be mated in combinations that can produce affected puppies.

Brittle or unusually discolored teeth, abnormal skeletal development, or progressive vision loss in a young Cane Corso requires veterinary evaluation.

This material is educational and does not replace DNA testing or ophthalmic, dental, or orthopedic veterinary examination.$bdy$),
    ($bgt$DSRA при Cane Corso: зъби, скелет и зрение$bgt$, 'it', $ttl$DSRA nel Cane Corso: denti, scheletro e vista$ttl$, $bdy$DSRA — Dental-Skeletal-Retinal Anomaly — è una malattia ereditaria descritta specificamente nel Cane Corso. Colpisce lo sviluppo dei denti, dello scheletro e della retina.

I cani affetti possono presentare denti insolitamente fragili, scoloriti o traslucidi. Anche lo sviluppo scheletrico può essere anomalo, mentre la degenerazione progressiva della retina può causare peggioramento della vista fino alla perdita visiva.

Queste alterazioni non dovrebbero essere considerate problemi separati e non collegati. La combinazione di anomalie dentali, di crescita e visive in un giovane Cane Corso è un motivo per discutere la DSRA con il veterinario e utilizzare il test genetico specifico.

La DSRA è ereditata come carattere autosomico recessivo. Il test DNA può classificare il cane come clear, carrier o affected.

Un cane clear non porta la mutazione testata. Un carrier possiede una copia e, secondo le conoscenze attuali, non sviluppa la malattia clinica, ma può trasmettere la mutazione alla prole. Un cane affected porta due copie della mutazione ed è geneticamente affetto.

La principale strategia preventiva è lo screening DNA prima della riproduzione e una pianificazione responsabile degli accoppiamenti. I portatori non dovrebbero essere esclusi automaticamente senza considerare la diversità genetica, ma non devono essere accoppiati in combinazioni che possano produrre cuccioli affetti.

Denti fragili o insolitamente scoloriti, sviluppo scheletrico anomalo o perdita progressiva della vista in un giovane Cane Corso richiedono una valutazione veterinaria.

Questo materiale è educativo e non sostituisce test DNA o visita veterinaria oftalmologica, dentale o ortopedica.$bdy$)
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
