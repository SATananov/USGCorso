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
    ('health_care', $ttl$Тазобедрена дисплазия: риск, скрининг и движение$ttl$, $bdy$Тазобедрената дисплазия е нарушение в развитието на тазобедрената става, при което ставата може да остане прекалено хлабава и с времето да развие дегенеративни промени и остеоартрит.

При големи породи като Cane Corso рискът не се определя от една причина. Наследствеността има значение, но върху развитието влияят още растежът, телесното тегло, храненето и натоварването по време на израстването.

Собственикът може да забележи нежелание за движение, куцота, скованост след почивка, трудност при ставане, промяна в походката или така нареченото „заешко подскачане“. Част от кучетата обаче могат да имат рентгенографски промени без очевидни симптоми.

Диагнозата и оценката на ставите се правят от ветеринарен лекар чрез клиничен преглед и образна диагностика. За развъден скрининг при Cane Corso се използват официални оценки като OFA или PennHIP.

Добрата кондиция и избягването на затлъстяване са важни през целия живот. При растящо куче целта не е максимално бързо натрупване на маса, а равномерен растеж и разумно натоварване.

Куцота, болка, внезапно ограничаване на движението или видимо влошаване изискват ветеринарна оценка.

Този материал е образователен и не замества ветеринарна диагноза или индивидуален план за лечение.$bdy$),
    ('health_care', $ttl$Лакътна дисплазия: повече от една диагноза$ttl$, $bdy$Лакътната дисплазия не е едно единствено заболяване, а група нарушения в развитието на лакътната става. Те могат да доведат до неравномерно натоварване, увреждане на хрущяла и развитие на остеоартрит.

Проблемите често се проявяват при млади, бързо растящи кучета от големи породи. Възможни признаци са куцота на преден крайник, скованост след почивка, намален обем на движение и болезненост при натоварване или манипулация на лакътя.

Симптомите могат да бъдат едностранни или двустранни и понякога са дискретни. Поради това само наблюдението на походката не е достатъчно за надеждна оценка.

Диагностиката може да включва рентгенография, а при определени случаи и по-детайлни методи като CT или артроскопия. За развъден скрининг на Cane Corso CHIC включва OFA оценка на лактите.

Контролът на телесното тегло, разумното натоварване по време на растежа и ранната ветеринарна оценка при постоянна куцота са важни.

Продължителна куцота, болка, подуване или нежелание за използване на крайника не трябва да се приемат като „нормален растеж“.

Този материал е образователен и не замества ветеринарна диагноза или индивидуален план за лечение.$bdy$),
    ('health_care', $ttl$Сърдечно здраве: защо скринингът има значение$ttl$, $bdy$Сърдечното здраве е част от отговорната профилактика при Cane Corso. Именно затова официалният CHIC протокол за породата включва сърдечна оценка.

Сърдечните заболявания могат да бъдат вродени или придобити и не винаги дават ранни видими признаци. Нормалното поведение у дома не е равнозначно на официален сърдечен скрининг.

Признаци, които заслужават ветеринарна оценка, включват необичайна умора, намалена издръжливост, затруднено дишане, кашлица, слабост, припадък или колапс. Тези признаци не са специфични само за сърдечно заболяване и не трябва да се използват за самодиагностика.

При преглед ветеринарният лекар може да оцени сърдечната честота и ритъм, да преслуша за шумове и при необходимост да препоръча допълнителни изследвания като електрокардиография, рентгенография или ехокардиография.

При кучета, използвани за развъждане, официалното документиране на сърдечния статус е по-надеждно от впечатлението, че кучето „изглежда здраво“.

Внезапен колапс, тежко затруднено дишане, посиняване или много бледи венци са спешни признаци и изискват незабавна ветеринарна помощ.

Този материал е образователен и не замества ветеринарна диагноза, кардиологичен преглед или индивидуален план за лечение.$bdy$),
    ('health_care', $ttl$Очите на Cane Corso: клепачи, дразнене и ранни сигнали$ttl$, $bdy$При Cane Corso могат да се срещат проблеми на клепачите и третия клепач, включително entropion, ectropion и пролапс на жлезата на третия клепач, често наричан „cherry eye“.

При entropion клепачът се завърта навътре и космите могат да дразнят повърхността на окото. При ectropion долният клепач се отпуска навън и оставя по-голяма част от конюнктивата изложена. При cherry eye жлезата на третия клепач пролабира и се вижда като червеникава тъкан във вътрешния ъгъл на окото.

Собственикът трябва да обръща внимание на постоянно сълзене, зачервяване, присвиване, търкане с лапа, секрет, чувствителност към светлина или внезапна промяна във външния вид на окото.

Болезненото око не трябва да се наблюдава с дни в очакване „да мине“. Увреждането на роговицата може да прогресира бързо и изисква ветеринарен преглед.

Не използвайте произволни капки за очи или човешки лекарства без ветеринарна препоръка. Някои препарати могат да бъдат неподходящи при определени увреждания на роговицата.

При развъждане очните и клепачните проблеми трябва да се разглеждат като част от общата здравна и функционална оценка на животното.

Този материал е образователен и не замества офталмологичен или ветеринарен преглед.$bdy$)
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
        'USG Editorial · Modern Health · Knowledge Content Pack 05',
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
          'source', 'USG Editorial Modern Health',
          'pack', 'KNOWLEDGE_CONTENT_PACK_05',
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
        moderation_note = 'USG Editorial · Modern Health · Knowledge Content Pack 05',
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
          'source', 'USG Editorial Modern Health',
          'pack', 'KNOWLEDGE_CONTENT_PACK_05',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Тазобедрена дисплазия: риск, скрининг и движение$bgt$, 'en', $ttl$Hip Dysplasia: Risk, Screening and Movement$ttl$, $bdy$Hip dysplasia is a developmental disorder of the hip joint in which excessive joint laxity can develop and later lead to degenerative change and osteoarthritis.

In large breeds such as the Cane Corso, risk is not determined by a single cause. Heredity matters, but growth rate, body weight, nutrition, and mechanical load during development also influence the outcome.

An owner may notice reluctance to move, lameness, stiffness after rest, difficulty rising, changes in gait, or a “bunny-hopping” pattern. Some dogs, however, can have radiographic changes without obvious clinical signs.

Diagnosis and joint assessment are performed by a veterinarian using clinical examination and diagnostic imaging. Official screening systems such as OFA or PennHIP are used for breeding evaluation in the Cane Corso.

Maintaining a healthy body condition and avoiding obesity are important throughout life. In a growing dog, the goal is not maximum speed of weight gain but steady development and sensible activity.

Lameness, pain, sudden restriction of movement, or noticeable deterioration should be evaluated by a veterinarian.

This material is educational and does not replace veterinary diagnosis or an individual treatment plan.$bdy$),
    ($bgt$Тазобедрена дисплазия: риск, скрининг и движение$bgt$, 'it', $ttl$Displasia dell'anca: rischio, screening e movimento$ttl$, $bdy$La displasia dell'anca è un disturbo dello sviluppo dell'articolazione coxo-femorale in cui può comparire un'eccessiva lassità articolare, con successivi cambiamenti degenerativi e osteoartrosi.

Nelle razze grandi come il Cane Corso il rischio non dipende da una sola causa. L'ereditarietà è importante, ma anche velocità di crescita, peso corporeo, alimentazione e carico meccanico durante lo sviluppo influenzano il risultato.

Il proprietario può osservare riluttanza al movimento, zoppia, rigidità dopo il riposo, difficoltà ad alzarsi, cambiamenti dell'andatura o il cosiddetto “bunny hopping”. Alcuni cani, tuttavia, possono mostrare alterazioni radiografiche senza segni clinici evidenti.

La diagnosi e la valutazione delle articolazioni vengono effettuate dal veterinario mediante esame clinico e diagnostica per immagini. Per lo screening riproduttivo nel Cane Corso vengono utilizzati sistemi ufficiali come OFA o PennHIP.

Mantenere una corretta condizione corporea ed evitare l'obesità è importante per tutta la vita. Nel cane in crescita l'obiettivo non è aumentare il peso il più rapidamente possibile, ma favorire uno sviluppo regolare e un'attività ragionevole.

Zoppia, dolore, improvvisa limitazione del movimento o un evidente peggioramento richiedono una valutazione veterinaria.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria o un piano terapeutico individuale.$bdy$),
    ($bgt$Лакътна дисплазия: повече от една диагноза$bgt$, 'en', $ttl$Elbow Dysplasia: More Than One Diagnosis$ttl$, $bdy$Elbow dysplasia is not a single disease but a group of developmental abnormalities affecting the elbow joint. They can produce abnormal loading, cartilage damage, and progressive osteoarthritis.

Problems often become apparent in young, rapidly growing large-breed dogs. Possible signs include forelimb lameness, stiffness after rest, reduced range of motion, and pain during loading or manipulation of the elbow.

Signs can affect one or both sides and may sometimes be subtle. For that reason, watching the gait alone is not enough for a reliable assessment.

Diagnosis can involve radiography and, in selected cases, more detailed imaging such as CT or arthroscopy. For Cane Corso breeding screening, the CHIC program includes OFA elbow evaluation.

Maintaining healthy body condition, using sensible exercise during growth, and seeking early veterinary assessment for persistent lameness are important.

Persistent limping, pain, swelling, or reluctance to use a limb should not simply be dismissed as “normal growth.”

This material is educational and does not replace veterinary diagnosis or an individual treatment plan.$bdy$),
    ($bgt$Лакътна дисплазия: повече от една диагноза$bgt$, 'it', $ttl$Displasia del gomito: più di una diagnosi$ttl$, $bdy$La displasia del gomito non è una singola malattia, ma un gruppo di anomalie dello sviluppo dell'articolazione del gomito. Possono provocare carichi anomali, danni alla cartilagine e osteoartrosi progressiva.

I problemi diventano spesso evidenti nei giovani cani di taglia grande a crescita rapida. I possibili segni comprendono zoppia dell'arto anteriore, rigidità dopo il riposo, riduzione dell'ampiezza di movimento e dolore durante il carico o la manipolazione del gomito.

I segni possono interessare uno o entrambi i lati e talvolta essere poco evidenti. Per questo motivo la sola osservazione dell'andatura non è sufficiente per una valutazione affidabile.

La diagnosi può includere radiografie e, in casi selezionati, metodiche più dettagliate come CT o artroscopia. Per lo screening riproduttivo del Cane Corso il programma CHIC include la valutazione OFA dei gomiti.

Mantenere una corretta condizione corporea, usare un'attività ragionevole durante la crescita e richiedere una valutazione veterinaria precoce in caso di zoppia persistente sono aspetti importanti.

Zoppia persistente, dolore, gonfiore o riluttanza a utilizzare un arto non dovrebbero essere liquidati come semplice “crescita normale”.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria o un piano terapeutico individuale.$bdy$),
    ($bgt$Сърдечно здраве: защо скринингът има значение$bgt$, 'en', $ttl$Cardiac Health: Why Screening Matters$ttl$, $bdy$Cardiac health is part of responsible preventive care in the Cane Corso. This is why the breed's official CHIC protocol includes a cardiac evaluation.

Heart disease can be congenital or acquired and may not produce obvious early signs. Normal behavior at home is not the same thing as formal cardiac screening.

Signs that deserve veterinary assessment include unusual fatigue, reduced exercise tolerance, difficulty breathing, coughing, weakness, fainting, or collapse. These signs are not specific to heart disease and should not be used for self-diagnosis.

During an examination, a veterinarian can assess heart rate and rhythm, listen for murmurs, and when appropriate recommend further testing such as electrocardiography, radiography, or echocardiography.

For dogs used in breeding, formal documentation of cardiac status is more reliable than the impression that a dog simply “looks healthy.”

Sudden collapse, severe breathing difficulty, blue discoloration, or very pale gums are emergency signs and require immediate veterinary care.

This material is educational and does not replace veterinary diagnosis, a cardiology examination, or an individual treatment plan.$bdy$),
    ($bgt$Сърдечно здраве: защо скринингът има значение$bgt$, 'it', $ttl$Salute cardiaca: perché lo screening è importante$ttl$, $bdy$La salute cardiaca fa parte della prevenzione responsabile nel Cane Corso. Per questo il protocollo CHIC ufficiale della razza comprende una valutazione cardiaca.

Le malattie cardiache possono essere congenite o acquisite e non sempre producono segni precoci evidenti. Un comportamento normale a casa non equivale a uno screening cardiaco ufficiale.

I segni che meritano una valutazione veterinaria comprendono affaticamento insolito, ridotta tolleranza all'esercizio, difficoltà respiratoria, tosse, debolezza, svenimento o collasso. Questi segni non sono specifici solo delle malattie cardiache e non devono essere usati per autodiagnosi.

Durante la visita il veterinario può valutare frequenza e ritmo cardiaco, ascoltare eventuali soffi e, quando necessario, raccomandare ulteriori esami come elettrocardiografia, radiografia o ecocardiografia.

Nei cani destinati alla riproduzione, una documentazione ufficiale dello stato cardiaco è più affidabile della semplice impressione che il cane “sembri sano”.

Collasso improvviso, grave difficoltà respiratoria, colorazione bluastra o gengive molto pallide sono segni di emergenza e richiedono assistenza veterinaria immediata.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria, una visita cardiologica o un piano terapeutico individuale.$bdy$),
    ($bgt$Очите на Cane Corso: клепачи, дразнене и ранни сигнали$bgt$, 'en', $ttl$Cane Corso Eyes: Eyelids, Irritation and Early Signs$ttl$, $bdy$Cane Corsos can develop problems involving the eyelids and third eyelid, including entropion, ectropion, and prolapse of the third-eyelid gland, commonly called “cherry eye.”

With entropion, the eyelid rolls inward and hair can irritate the surface of the eye. With ectropion, the lower eyelid turns or sags outward, leaving more conjunctival tissue exposed. With cherry eye, the third-eyelid gland prolapses and appears as reddish tissue at the inner corner of the eye.

Owners should watch for persistent tearing, redness, squinting, pawing at the eye, discharge, sensitivity to light, or a sudden change in the appearance of the eye.

A painful eye should not be watched for several days in the hope that it will simply pass. Corneal injury can progress quickly and requires veterinary assessment.

Do not use random eye drops or human medications without veterinary advice. Some products can be inappropriate in the presence of certain corneal injuries.

In breeding decisions, eyelid and eye problems should be considered as part of the dog's overall health and functional evaluation.

This material is educational and does not replace an ophthalmic or veterinary examination.$bdy$),
    ($bgt$Очите на Cane Corso: клепачи, дразнене и ранни сигнали$bgt$, 'it', $ttl$Gli occhi del Cane Corso: palpebre, irritazione e segnali precoci$ttl$, $bdy$Nel Cane Corso possono comparire problemi delle palpebre e della terza palpebra, tra cui entropion, ectropion e prolasso della ghiandola della terza palpebra, comunemente chiamato “cherry eye”.

Nell'entropion la palpebra si ripiega verso l'interno e i peli possono irritare la superficie dell'occhio. Nell'ectropion la palpebra inferiore si rovescia o cede verso l'esterno, esponendo maggiormente la congiuntiva. Nel cherry eye la ghiandola della terza palpebra prolassa e appare come tessuto rossastro nell'angolo interno dell'occhio.

Il proprietario dovrebbe osservare lacrimazione persistente, arrossamento, ammiccamento o chiusura dell'occhio, sfregamento con la zampa, secrezioni, sensibilità alla luce o un cambiamento improvviso dell'aspetto dell'occhio.

Un occhio dolorante non dovrebbe essere osservato per giorni sperando che il problema passi da solo. Le lesioni corneali possono progredire rapidamente e richiedono una valutazione veterinaria.

Non utilizzare colliri casuali o farmaci per uso umano senza consiglio veterinario. Alcuni prodotti possono essere inappropriati in presenza di determinate lesioni corneali.

Nelle decisioni riproduttive, i problemi oculari e palpebrali dovrebbero essere considerati come parte della valutazione generale della salute e della funzionalità del cane.

Questo materiale è educativo e non sostituisce una visita oftalmologica o veterinaria.$bdy$)
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
