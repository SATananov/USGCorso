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
    ('nutrition', $ttl$Храненето трябва да изгражда здраве$ttl$, $bdy$При Cane Corso храненето не трябва да бъде средство за бързо постигане на маса.

Голямото младо куче лесно създава впечатление, че повече храна и по-бърз растеж означават повече сила. Но растежът не е състезание. Кости, стави, мускули и метаболизъм трябва да се развиват в равновесие.

За малките от големи породи основният принцип е пълноценна и балансирана храна, подходяща за растеж, с контрол върху телесната кондиция и без излишна енергия.

Добавките не са автоматично полезни. Допълнителен калций, фосфор или витамин D върху вече пълноценна диета трябва да имат ясна професионална причина.

Традиционните разкази за мляко, яйца, хляб, месо и сурови храни имат културна стойност, но не трябва да се превръщат в универсална съвременна хранителна схема.

Домашните, суровите и други нетрадиционни режими трябва да бъдат оценявани за хранителна адекватност и безопасност.

Принципът е прост: храненето трябва да изгражда здраве, движение и устойчивост — не впечатление.

Този материал е образователен и не замества индивидуална ветеринарна или хранителна консултация.$bdy$),
    ('training', $ttl$Спокойствие, различаване и контрол$ttl$, $bdy$Обучението на Cane Corso не трябва да създава куче, което реагира повече. Трябва да изгражда куче, което разбира по-добре.

Охранителната функция не е лаене по всичко, постоянна подозрителност или хвърляне по оградата. Истинската стойност е в способността да се различава нормалното от необичайното.

Затова обучението трябва да укрепва спокойствието, самоконтрола, връзката с човека и способността за възстановяване след стимул.

Куче, което може да остане спокойно в позната среда, не е по-слаб пазач. Често именно увереността му позволява да запази реакцията за момента, когато тя е необходима.

Няма нужда да се създават опасни провокации, за да се проверява характерът. Много повече може да се научи от ежедневното поведение: как кучето наблюдава, как приема нормални хора и шумове, дали търси човека като ориентир и дали се връща към спокойствие.

Силата не е да тръгнеш при всеки стимул. Силата е да знаеш кога да не тръгнеш.

Обучението трябва да прави Cane Corso по-предвидимо, по-стабилно и по-контролируемо в реалния живот.$bdy$),
    ('behavior', $ttl$Coscienza: интелигентното присъствие$ttl$, $bdy$Една от най-интересните думи, свързани с характера на Cane Corso, е италианската „coscienza“.

Тук тя не означава човешко морално съзнание. Използва се като народен начин да се опише интелигентното присъствие на кучето — способността да чете човека и средата.

Това включва усещане за промяна в тона, стойката или погледа; способност да различава ситуацията; да не се нуждае постоянно от подтик към действие; да остава умствено присъстващо.

Тази характеристика не може да се сведе до послушание или агресивност.

Cane Corso с добър характер трябва да може да преминава от спокойствие към внимание и при нужда отново да се връща към спокойствие.

Истинската смелост не е шумът. Тя е готовността да се действа, когато е нужно, и способността да не се действа, когато не е нужно.

Връзката с човека е важна част от това поведение. Кучето може да използва своя човек като ориентир, без да бъде постоянно зависимо от команда.

„Coscienza“ е ценна дума, защото ни напомня, че характерът е повече от реакция. Той е разбиране, различаване и баланс.$bdy$),
    ('health_care', $ttl$Наука, съзнание и природа$ttl$, $bdy$Превенцията при Cane Corso може да бъде обобщена в три думи: наука, съзнание и природа.

Наука означава да използваме онова, което съвременната ветеринарна медицина знае. Диагностика, ваксинации, паразитна профилактика, скрининг, репродуктивно управление и хранене трябва да следват актуални професионални насоки.

Съзнание означава отговорност. Здравословен проблем не трябва да се прикрива само защото кучето е красиво, известно или ценно. Качеството на живот и психичното благополучие също са част от здравето.

Природа не означава да оставим кучето без грижа. Означава да помним, че то има нужда от движение, почивка, социален контакт, среда и живот, подходящи за неговата природа.

Историческите ветеринарни практики имат стойност като памет и култура, но не са автоматично терапевтични протоколи за днес.

Превенцията е мястото, където медицината и селекцията се срещат. Когато предотвратим проблем, пазим не само отделното животно, а и качеството на породата.

Истинската приемственост не е да повтаряме ограниченията на миналото. Тя е да съчетаем наблюдението и функционалната строгост от миналото със здравните знания на настоящето.

Този материал е образователен и не замества ветеринарна диагноза, лечение или индивидуален профилактичен план.$bdy$)
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
        'USG Editorial · USGBookApp · Knowledge Content Pack 03',
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
          'source', 'USGBookApp',
          'pack', 'KNOWLEDGE_CONTENT_PACK_03',
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
        moderation_note = 'USG Editorial · USGBookApp · Knowledge Content Pack 03',
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
          'source', 'USGBookApp',
          'pack', 'KNOWLEDGE_CONTENT_PACK_03',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Храненето трябва да изгражда здраве$bgt$, 'en', $ttl$Nutrition Should Build Health$ttl$, $bdy$Nutrition in the Cane Corso should not be used as a shortcut to rapid mass.

A large young dog can easily create the impression that more food and faster growth mean more strength. But growth is not a race. Bones, joints, muscles, and metabolism need to develop in balance.

For large-breed puppies, the basic principle is a complete and balanced diet appropriate for growth, with attention to body condition and without excessive energy intake.

Supplements are not automatically beneficial. Extra calcium, phosphorus, or vitamin D on top of an already complete diet should have a clear professional reason.

Traditional accounts involving milk, eggs, bread, meat, or raw feeding are culturally valuable, but they should not become a universal modern feeding plan.

Home-prepared, raw, and other unconventional diets should be evaluated for nutritional adequacy and safety.

The principle is simple: nutrition should build health, movement, and resilience — not an impression.

This material is educational and does not replace individual veterinary or nutritional advice.$bdy$),
    ($bgt$Храненето трябва да изгражда здраве$bgt$, 'it', $ttl$L'alimentazione deve costruire salute$ttl$, $bdy$Nel Cane Corso l'alimentazione non deve essere usata come scorciatoia verso una massa precoce.

Un grande cane giovane può facilmente dare l'impressione che più cibo e crescita più rapida significhino più forza. Ma la crescita non è una gara. Ossa, articolazioni, muscoli e metabolismo devono svilupparsi in equilibrio.

Per i cuccioli di taglia grande, il principio di base è un'alimentazione completa e bilanciata adatta alla crescita, con attenzione alla condizione corporea e senza eccesso energetico.

Gli integratori non sono automaticamente utili. Calcio, fosforo o vitamina D aggiunti a una dieta già completa devono avere una chiara motivazione professionale.

I racconti tradizionali su latte, uova, pane, carne o alimentazione cruda hanno valore culturale, ma non devono diventare automaticamente un piano alimentare moderno universale.

Le diete casalinghe, crude e altri regimi non convenzionali devono essere valutati per adeguatezza nutrizionale e sicurezza.

Il principio è semplice: l'alimentazione deve costruire salute, movimento e resistenza — non impressione.

Questo materiale è educativo e non sostituisce una consulenza veterinaria o nutrizionale individuale.$bdy$),
    ($bgt$Спокойствие, различаване и контрол$bgt$, 'en', $ttl$Calmness, Discrimination and Control$ttl$, $bdy$Training a Cane Corso should not create a dog that reacts more. It should create a dog that understands better.

Guarding is not barking at everything, permanent suspicion, or constantly throwing itself at a fence. Real value lies in the ability to distinguish normality from anomaly.

Training should therefore strengthen calmness, self-control, the relationship with the person, and the ability to recover after a stimulus.

A dog that can remain calm in a familiar environment is not a weaker guardian. Often, confidence is exactly what allows it to save its reaction for the moment when action is actually needed.

There is no need to create dangerous provocations to test character. Daily behavior tells us much more: how the dog observes, how it accepts normal people and noises, whether it looks to its person as a reference, and whether it returns to calm.

Strength is not launching into action at every stimulus. Strength is knowing when not to act.

Training should make the Cane Corso more predictable, stable, and controllable in real life.$bdy$),
    ($bgt$Спокойствие, различаване и контрол$bgt$, 'it', $ttl$Calma, capacità di distinguere e controllo$ttl$, $bdy$L'addestramento del Cane Corso non deve creare un cane che reagisce di più. Deve creare un cane che comprende meglio.

La guardia non significa abbaiare a tutto, vivere nel sospetto permanente o lanciarsi continuamente contro una recinzione. Il vero valore sta nella capacità di distinguere la normalità dall'anomalia.

L'addestramento dovrebbe quindi rafforzare calma, autocontrollo, relazione con la persona e capacità di recuperare dopo uno stimolo.

Un cane che sa restare tranquillo in un ambiente familiare non è un guardiano più debole. Spesso è proprio la sicurezza a permettergli di conservare la reazione per quando serve davvero.

Non è necessario creare provocazioni pericolose per verificare il carattere. Il comportamento quotidiano dice molto di più: come il cane osserva, come accetta persone e rumori normali, se cerca la persona come riferimento e se ritorna alla calma.

La forza non è partire a ogni stimolo. La forza è sapere quando non agire.

L'addestramento dovrebbe rendere il Cane Corso più prevedibile, stabile e controllabile nella vita reale.$bdy$),
    ($bgt$Coscienza: интелигентното присъствие$bgt$, 'en', $ttl$Coscienza: Intelligent Awareness$ttl$, $bdy$One of the most interesting words connected with Cane Corso character is the Italian word *coscienza*.

Here it does not mean human moral conscience. It is used as a traditional way of describing intelligent awareness in the dog — the ability to read people and the environment.

This includes noticing changes in tone, posture, or gaze; discriminating between situations; not needing constant prompting into action; and remaining mentally present.

This quality cannot be reduced to obedience or aggression.

A Cane Corso with sound character should be able to move from calmness to attention and, when appropriate, return to calm again.

True courage is not noise. It is readiness to act when action is needed, and the ability not to act when it is not.

The relationship with the person is an important part of this behavior. The dog can use its person as a point of reference without being constantly dependent on a command.

*Coscienza* is a valuable word because it reminds us that character is more than reaction. It is understanding, discrimination, and balance.$bdy$),
    ($bgt$Coscienza: интелигентното присъствие$bgt$, 'it', $ttl$Coscienza: presenza intelligente$ttl$, $bdy$Una delle parole più interessanti legate al carattere del Cane Corso è *coscienza*.

Qui non significa coscienza morale umana. È una parola tradizionale usata per descrivere la presenza intelligente del cane — la capacità di leggere la persona e l'ambiente.

Comprende il percepire cambiamenti nel tono, nella postura o nello sguardo; distinguere le situazioni; non avere bisogno di essere continuamente spinto all'azione; rimanere mentalmente presente.

Questa qualità non può essere ridotta né all'obbedienza né all'aggressività.

Un Cane Corso con buon carattere dovrebbe saper passare dalla calma all'attenzione e, quando appropriato, tornare di nuovo alla calma.

Il vero coraggio non è rumore. È disponibilità ad agire quando serve e capacità di non agire quando non serve.

Il rapporto con la persona è una parte importante di questo comportamento. Il cane può usare il proprio uomo come punto di riferimento senza dipendere continuamente da un comando.

*Coscienza* è una parola preziosa perché ci ricorda che il carattere è più della reazione. È comprensione, capacità di distinguere ed equilibrio.$bdy$),
    ($bgt$Наука, съзнание и природа$bgt$, 'en', $ttl$Science, Conscience and Nature$ttl$, $bdy$Prevention in the Cane Corso can be summarized in three words: science, conscience, and nature.

Science means using what modern veterinary medicine has learned. Diagnostics, vaccination, parasite prevention, screening, reproductive management, and nutrition should follow current professional guidance.

Conscience means responsibility. A health problem should not be hidden simply because a dog is beautiful, famous, or valuable. Quality of life and mental well-being are also part of health.

Nature does not mean leaving the dog without care. It means remembering that the dog needs movement, rest, social contact, environment, and a life compatible with its nature.

Historical veterinary practices have value as memory and culture, but they are not automatically therapeutic protocols for today.

Prevention is where medicine and selection meet. When we prevent a problem, we protect not only the individual animal but also the quality of the breed.

True continuity does not mean repeating the limitations of the past. It means combining the observation and functional severity of the past with the health knowledge of the present.

This material is educational and does not replace veterinary diagnosis, treatment, or an individual preventive-care plan.$bdy$),
    ($bgt$Наука, съзнание и природа$bgt$, 'it', $ttl$Scienza, coscienza e natura$ttl$, $bdy$La prevenzione nel Cane Corso può essere riassunta in tre parole: scienza, coscienza e natura.

Scienza significa utilizzare ciò che la medicina veterinaria moderna ha imparato. Diagnostica, vaccinazioni, prevenzione parassitaria, screening, gestione riproduttiva e alimentazione devono seguire indicazioni professionali aggiornate.

Coscienza significa responsabilità. Un problema di salute non dovrebbe essere nascosto soltanto perché un cane è bello, famoso o prezioso. Anche qualità della vita e benessere mentale fanno parte della salute.

Natura non significa lasciare il cane senza cure. Significa ricordare che ha bisogno di movimento, riposo, contatto sociale, ambiente e una vita compatibile con la propria natura.

Le pratiche veterinarie storiche hanno valore come memoria e cultura, ma non diventano automaticamente protocolli terapeutici moderni.

La prevenzione è il punto in cui medicina e selezione si incontrano. Prevenire un problema significa proteggere non soltanto il singolo animale, ma anche la qualità della razza.

La vera continuità non consiste nel ripetere i limiti del passato. Consiste nell'unire l'osservazione e la severità funzionale di ieri con le conoscenze sanitarie di oggi.

Questo materiale è educativo e non sostituisce diagnosi, trattamento veterinario o un piano preventivo individuale.$bdy$)
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
