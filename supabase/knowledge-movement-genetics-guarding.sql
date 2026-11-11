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
    ('function_type', $ttl$Движението проверява структурата$ttl$, $bdy$Едно Cane Corso може да изглежда мощно в покой и да разкаже съвсем друга история, когато се движи.

Движението е една от най-честните проверки на структурата. Когато кучето върви или тича, стават видими равновесието, координацията, ефективността на крайниците, способността да носи собственото си тегло и да се възстановява след усилие.

Историческото Cane Corso не е било куче за няколко минути в ринг. То е трябвало да следва човека, да преминава неравен терен, да се движи около животни, да ускорява при нужда и после да продължава деня си.

Затова движението е естествена мярка срещу крайността. Прекалено тежко, непропорционално или функционално ограничено тяло може да впечатлява неподвижно и да загуби качество още с първите крачки.

Функцията не позволява на морфологията да лъже дълго.

Силата има смисъл само ако кучето може да я занесе там, където е нужна.

Cane Corso трябва да създава усещането, че мощта може да се движи. Структурата не е статуя. Тя е тяло, предназначено да живее.$bdy$),
    ('health_care', $ttl$Генетично разнообразие и отговорна селекция$ttl$, $bdy$Всяка селекция стеснява нещо. Затова съхраняването на типа без обедняване на популацията изисква баланс между последователност, генетична вариабилност и познаване на линиите.

При затворена популация всяко развъдно решение влияе върху генетичното разнообразие. Близкородствените съчетания, генетичните тесни места и прекомерната употреба на малко разплодници могат да увеличат хомозиготността и да ограничат бъдещия избор.

Вариабилността не е обратното на типа. Две типични кучета не е необходимо да бъдат копия.

Pedigree, коефициенти на инбридинг и геномни инструменти могат да помогнат за измерване на риска, но не заменят наблюдението на здраве, характер, структура и това, което животното реално предава.

Разплодникът не трябва да се оценява само по собствената си визия. Важно е какъв модел оставя в поколенията.

Прекаленото уеднаквяване може да изглежда като контрол, но една жива порода има нужда и от достатъчно генетична ширина, за да запази здраве, устойчивост и възможност за бъдеща селекция.

Вариабилността е материалът, върху който селекцията може да работи.$bdy$),
    ('basics', $ttl$Родословието е инструмент, не присъда$ttl$, $bdy$Родословието е силен инструмент, защото пази паметта за произхода. Но документът не може да замени живото куче.

Точният pedigree позволява да се проследяват предци, да се изучават линии, да се планират съчетания и да се оценява родствеността. Това го прави ценен за отговорната селекция.

Но документът описва кои са регистрираните предци. Сам по себе си той не може да гарантира здраве, характер, функционалност или типичност.

По същия начин куче без официален pedigree не става автоматично по-добро. Документален статус и биологично-функционална стойност са различни неща.

Добрата кинология трябва да използва документа, за да защитава реалните качества на породата — не да заменя наблюдението с хартия.

Най-важният въпрос не е само „от кого идва това куче?“, а и „какво представлява това куче и какво може да предаде?“

Родословието трябва да служи на селекцията. Когато селекцията започне да служи единствено на документа, редът се обръща.$bdy$),
    ('behavior', $ttl$Охраната започва с различаване$ttl$, $bdy$Охраната не е постоянна реакция. Тя започва със способността да се различава нормалното от необичайното.

Cane Corso, което лае на всеки шум или се хвърля към всяко движение, може да изглежда бдително, но ако не умее да различава, то просто реагира повече.

Истинската охранителна функция включва внимание, увереност, териториалност, връзка с човека и способност за бързо връщане към спокойствие след стимул.

В традиционната работна среда кучето е живеело сред хора, животни, посетители, шумове и ежедневна дейност. Ако всичко се възприемаше като заплаха, кучето би било неизползваемо.

Затова добрият пазач не живее във война със света.

Спокойното Cane Corso не е непременно по-слаб пазач. Понякога именно увереността позволява реакцията да бъде запазена за момента, когато наистина е необходима.

Не е нужно да се създават опасни провокации, за да се оценява тази функция. Ежедневното поведение показва много повече: наблюдение, възстановяване след стимул, доверие към човека и стабилност.

Охраната е полезна, когато е контролирана. Различаването е част от силата.$bdy$)
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
        'USG Editorial · USGBookApp · Knowledge Content Pack 04',
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
          'pack', 'KNOWLEDGE_CONTENT_PACK_04',
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
        moderation_note = 'USG Editorial · USGBookApp · Knowledge Content Pack 04',
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
          'pack', 'KNOWLEDGE_CONTENT_PACK_04',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Движението проверява структурата$bgt$, 'en', $ttl$Movement Tests Structure$ttl$, $bdy$A Cane Corso can look powerful while standing still and tell a very different story when it moves.

Movement is one of the most honest tests of structure. When the dog walks or runs, balance, coordination, limb efficiency, the ability to carry its own weight, and the ability to recover after effort become visible.

The historical Cane Corso was not a dog designed for a few minutes in a ring. It had to follow people, cross uneven ground, move around animals, accelerate when necessary, and then continue the rest of its day.

Movement is therefore a natural measure against excess. A body that is too heavy, disproportionate, or functionally limited can impress while standing still and lose quality within the first few steps.

Function does not allow morphology to lie for long.

Strength matters only if the dog can carry it where it is needed.

A Cane Corso should give the impression that power can move. Structure is not a statue. It is a body meant to live.$bdy$),
    ($bgt$Движението проверява структурата$bgt$, 'it', $ttl$Il movimento verifica la struttura$ttl$, $bdy$Un Cane Corso può apparire potente da fermo e raccontare una storia molto diversa quando si muove.

Il movimento è una delle verifiche più sincere della struttura. Quando il cane cammina o corre diventano visibili equilibrio, coordinazione, efficienza degli arti, capacità di portare il proprio peso e capacità di recuperare dopo lo sforzo.

Il Cane Corso storico non era un cane pensato per pochi minuti in un ring. Doveva seguire l'uomo, attraversare terreni irregolari, muoversi accanto agli animali, accelerare quando necessario e poi continuare la propria giornata.

Il movimento è quindi una misura naturale contro l'eccesso. Un corpo troppo pesante, sproporzionato o funzionalmente limitato può impressionare da fermo e perdere qualità già nei primi passi.

La funzione non permette alla morfologia di mentire a lungo.

La forza ha senso soltanto se il cane può portarla dove serve.

Un Cane Corso dovrebbe dare l'impressione che la potenza possa muoversi. La struttura non è una statua. È un corpo destinato a vivere.$bdy$),
    ($bgt$Генетично разнообразие и отговорна селекция$bgt$, 'en', $ttl$Genetic Diversity and Responsible Selection$ttl$, $bdy$Every form of selection narrows something. Preserving type without impoverishing the population therefore requires a balance between consistency, genetic variability, and knowledge of lines.

In a closed population, every breeding decision affects genetic diversity. Close matings, bottlenecks, and excessive use of a small number of breeding animals can increase homozygosity and reduce future choices.

Variability is not the opposite of type. Two typical dogs do not need to be copies of one another.

Pedigrees, inbreeding coefficients, and genomic tools can help measure risk, but they do not replace observation of health, character, structure, and what an individual actually transmits.

A breeding animal should not be judged only by its own appearance. What matters is also the pattern it leaves across generations.

Excessive uniformity may look like control, but a living breed also needs enough genetic breadth to preserve health, resilience, and future selection options.

Variability is the material on which selection can work.$bdy$),
    ($bgt$Генетично разнообразие и отговорна селекция$bgt$, 'it', $ttl$Diversità genetica e selezione responsabile$ttl$, $bdy$Ogni selezione restringe qualcosa. Conservare il tipo senza impoverire la popolazione richiede quindi equilibrio tra coerenza, variabilità genetica e conoscenza delle linee.

In una popolazione chiusa, ogni decisione riproduttiva influenza la diversità genetica. Accoppiamenti stretti, colli di bottiglia e uso eccessivo di pochi riproduttori possono aumentare l'omozigosi e ridurre le possibilità future.

La variabilità non è il contrario del tipo. Due cani tipici non devono essere copie l'uno dell'altro.

Pedigree, coefficienti di consanguineità e strumenti genomici possono aiutare a misurare il rischio, ma non sostituiscono l'osservazione di salute, carattere, struttura e di ciò che un soggetto trasmette realmente.

Un riproduttore non dovrebbe essere giudicato soltanto per la propria immagine. Conta anche il pattern che lascia nelle generazioni.

Un'eccessiva uniformità può sembrare controllo, ma una razza viva ha bisogno anche di una base genetica sufficientemente ampia per conservare salute, resilienza e possibilità di selezione futura.

La variabilità è la materia sulla quale la selezione può lavorare.$bdy$),
    ($bgt$Родословието е инструмент, не присъда$bgt$, 'en', $ttl$Pedigree Is a Tool, Not a Verdict$ttl$, $bdy$A pedigree is a powerful tool because it preserves the memory of ancestry. But a document cannot replace the living dog.

An accurate pedigree allows us to trace ancestors, study lines, plan matings, and evaluate relatedness. That makes it valuable for responsible selection.

But the document describes who the registered ancestors are. By itself, it cannot guarantee health, character, functionality, or type.

In the same way, a dog without an official pedigree does not automatically become better. Documentary status and biological-functional value are different things.

Good cynology should use documentation to protect the real qualities of the breed — not replace observation with paper.

The important question is not only “where does this dog come from?” but also “what is this dog, and what can it transmit?”

The pedigree should serve selection. When selection begins to serve only the document, the order is reversed.$bdy$),
    ($bgt$Родословието е инструмент, не присъда$bgt$, 'it', $ttl$Il pedigree è uno strumento, non un verdetto$ttl$, $bdy$Il pedigree è uno strumento potente perché conserva la memoria dell'ascendenza. Ma un documento non può sostituire il cane vivo.

Un pedigree accurato permette di seguire gli antenati, studiare le linee, programmare accoppiamenti e valutare la parentela. Per questo è prezioso nella selezione responsabile.

Ma il documento descrive chi sono gli antenati registrati. Da solo non può garantire salute, carattere, funzionalità o tipicità.

Allo stesso modo, un cane senza pedigree ufficiale non diventa automaticamente migliore. Status documentale e valore biologico-funzionale sono due cose diverse.

La buona cinofilia dovrebbe usare i documenti per proteggere le qualità reali della razza — non sostituire l'osservazione con la carta.

La domanda importante non è soltanto “da chi viene questo cane?”, ma anche “che cosa è questo cane e che cosa può trasmettere?”

Il pedigree deve servire la selezione. Quando la selezione comincia a servire soltanto il documento, l'ordine si capovolge.$bdy$),
    ($bgt$Охраната започва с различаване$bgt$, 'en', $ttl$Guarding Begins with Discrimination$ttl$, $bdy$Guarding is not constant reaction. It begins with the ability to distinguish normality from anomaly.

A Cane Corso that barks at every noise or throws itself toward every movement may look vigilant, but if it cannot discriminate, it is simply reacting more.

True guarding function includes attention, confidence, territorial awareness, a relationship with the person, and the ability to return quickly to calm after a stimulus.

In the traditional working environment, the dog lived among people, animals, visitors, noises, and daily activity. If everything had been interpreted as a threat, the dog would have been unusable.

A good guardian therefore does not live in a permanent war with the world.

A calm Cane Corso is not necessarily a weaker guardian. Sometimes confidence is exactly what allows the reaction to be saved for the moment when it is truly needed.

Dangerous provocations are not necessary to evaluate this function. Daily behavior shows much more: observation, recovery after stimulation, trust in the person, and stability.

Guarding is useful when it is controlled. Discrimination is part of strength.$bdy$),
    ($bgt$Охраната започва с различаване$bgt$, 'it', $ttl$La guardia comincia dalla capacità di distinguere$ttl$, $bdy$La guardia non è reazione continua. Comincia dalla capacità di distinguere la normalità dall'anomalia.

Un Cane Corso che abbaia a ogni rumore o si lancia verso ogni movimento può sembrare vigile, ma se non sa distinguere sta semplicemente reagendo di più.

La vera funzione di guardia comprende attenzione, sicurezza, territorialità, rapporto con la persona e capacità di tornare rapidamente alla calma dopo uno stimolo.

Nell'ambiente di lavoro tradizionale, il cane viveva tra persone, animali, visitatori, rumori e attività quotidiane. Se avesse interpretato tutto come minaccia, sarebbe stato inutilizzabile.

Un buon guardiano, quindi, non vive in guerra permanente con il mondo.

Un Cane Corso tranquillo non è necessariamente un guardiano più debole. A volte è proprio la sicurezza a permettere di conservare la reazione per il momento in cui serve davvero.

Non è necessario creare provocazioni pericolose per valutare questa funzione. Il comportamento quotidiano mostra molto di più: osservazione, recupero dopo lo stimolo, fiducia nella persona e stabilità.

La guardia è utile quando è controllata. La capacità di distinguere fa parte della forza.$bdy$)
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
