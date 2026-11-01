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
    ('basics', $ttl$Формата като жива архитектура$ttl$, $bdy$Формата на Cane Corso е важна, но сама по себе си не е достатъчна.

Типът трябва да бъде разпознаваем. Cane Corso има собствена морфологична идентичност, структура и начин да заема пространството. Но тази форма трябва да се чете като резултат от равновесие.

Ако кучето трябва да бъде подвижно, структурата трябва да позволява подвижност. Ако трябва да бъде мощно, трябва да има достатъчно субстанция. Ако трябва да живее близо до човека и да се намесва, когато е нужно, тялото не може да бъде построено като неподвижен паметник.

Кучето в тип не е онова, при което една характеристика е доведена до максимум. То е онова, при което характеристиките съжителстват, без да се унищожават взаимно.

По-голяма глава, по-широк гръден кош, по-тежка кост или по-къса муцуна не могат да се оценяват изолирано. Всяка крайност променя цялата система.

Кучето не е сбор от детайли. То е организъм, който трябва да функционира.

Функционалната красота се ражда от хармонията. Формата спира да бъде фотография и се превръща в жива архитектура, когато видим кучето в движение, в контакт със средата и в реално поведение.$bdy$),
    ('function_type', $ttl$Стандартът като карта$ttl$, $bdy$Стандартът се опитва да превърне една реална популация в общ език. Неговата стойност е голяма, но причината не трябва да се обръща: текстът идва след кучето, не кучето след текста.

Стандартът е създаден, за да описва и защитава тип. Той става проблемен, когато бъде прочетен като механична формула.

Функционалното Cane Corso трябва да остане хармонично животно. Мерките не съществуват изолирано. Главата, шията, тялото, крайниците, движението и характерът трябва да принадлежат на един и същ организъм.

Стандартът може да се чете като карта или като идол.

Като карта той описва разпознат баланс и помага на селекционера да не изгуби посоката. Когато се превърне в идол, видимите детайли лесно се тласкат към крайност само защото впечатляват окото.

Д-р Флавио Бруно поставя идеалния тип в равновесието между структура, характер, нагласа и темперамент.

Затова за всяка характеристика трябва да питаме: за какво служи, какъв функционален компромис представлява и какво се случва, когато бъде доведена до крайност.$bdy$),
    ('development', $ttl$Майката като първа среда$ttl$, $bdy$Селекцията не започва, когато избираме малкото. Тя започва много по-рано — с избора на родителите и със способността на майката да износи, роди и отгледа здраво кучило.

Една порода не се съхранява само чрез избора на мъжки. Съхранява се и чрез майката.

Разплодната женска не е генетичен контейнер. Здравето, характерът, майчинските качества, храненето, стресът и условията на живот влияят върху развитието на кучилото.

В първите дни въпросът не е кое малко е „най-красиво“. Отговорността е всички малки да получат възможност да се развиват при възможно най-добри условия.

Историческите практически съвети за бременност, раждане, коластра, добавки и профилактика не трябва да се използват като готови медицински рецепти. Диагнозата, медикаментите и интервенциите принадлежат на съвременната ветеринарна медицина.

Принципът, който остава, е ясен: наблюдение, профилактика, бързо разпознаване на проблем и уважение към естеството на процеса.

Майката не предава само гени. Тя е първата среда на малкото.$bdy$),
    ('history', $ttl$Масерията: мястото, което селектира$ttl$, $bdy$Масерията променя начина, по който гледаме историята на Cane Corso. Тук кучето престава да бъде абстрактна историческа фигура и се връща в реална икономика, територия и работен ден.

Масерията не е само сграда. Тя е жива система от хора, земя, добитък, складове, пътища, инструменти, храна, опасности и ежедневни ритми.

В този свят кучето има конкретна функция и стойността му се проверява всеки ден.

Различните задачи могат да бъдат разпределени между различни типове кучета. Малкото будно куче предупреждава. Голямото пастирско куче пази стадото. Cane Corso остава по-близо до човека, имота, добитъка, лова и задачите, които изискват мобилност и намеса.

Тази среда не търпи безконтролно куче. Силата трябва да съществува заедно с контрол.

Територията също участва в селекцията: климат, разстояния, терен, вид добитък и размер на имота променят това, което се изисква от кучето.

Масерията не произвежда еднакви фотографии. Тя произвежда кучета, способни да решават едни и същи реални проблеми.$bdy$)
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
        'USG Editorial · USGBookApp · Knowledge Content Pack 02',
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
          'pack', 'KNOWLEDGE_CONTENT_PACK_02',
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
        moderation_note = 'USG Editorial · USGBookApp · Knowledge Content Pack 02',
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
          'pack', 'KNOWLEDGE_CONTENT_PACK_02',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Формата като жива архитектура$bgt$, 'en', $ttl$Form as Living Architecture$ttl$, $bdy$The form of the Cane Corso matters, but form by itself is not enough.

Type must remain recognizable. The Cane Corso has its own morphological identity, structure, and way of occupying space. Yet that form has to be read as the result of balance.

If the dog must be mobile, its structure must allow mobility. If it must be powerful, it needs sufficient substance. If it must live close to people and intervene when needed, its body cannot be built like an immovable monument.

A dog that is in type is not the dog in which one characteristic has been pushed to the maximum. It is the dog in which the characteristics coexist without destroying one another.

A larger head, broader chest, heavier bone, or shorter muzzle cannot be judged in isolation. Every exaggeration changes the whole system.

A dog is not the sum of its details. It is an organism that has to function.

Functional beauty is born from harmony. Form stops being a photograph and becomes living architecture when we see the dog move, interact with its environment, and behave in real situations.$bdy$),
    ($bgt$Формата като жива архитектура$bgt$, 'it', $ttl$La forma come architettura vivente$ttl$, $bdy$La forma del Cane Corso è importante, ma la forma da sola non basta.

Il tipo deve restare riconoscibile. Il Cane Corso possiede una propria identità morfologica, una propria struttura e un proprio modo di occupare lo spazio. Ma questa forma deve essere letta come il risultato di un equilibrio.

Se il cane deve essere mobile, la struttura deve permettere mobilità. Se deve essere potente, deve possedere sufficiente sostanza. Se deve vivere vicino all'uomo e intervenire quando serve, il corpo non può essere costruito come un monumento immobile.

Il cane in tipo non è quello nel quale una caratteristica è stata portata al massimo. È quello nel quale le caratteristiche convivono senza distruggersi a vicenda.

Una testa più grande, un torace più largo, un osso più pesante o un muso più corto non possono essere giudicati isolatamente. Ogni estremizzazione modifica l'intero sistema.

Un cane non è la somma dei suoi dettagli. È un organismo che deve funzionare.

La bellezza funzionale nasce dall'armonia. La forma smette di essere fotografia e diventa architettura vivente quando vediamo il cane muoversi, interagire con l'ambiente e comportarsi nelle situazioni reali.$bdy$),
    ($bgt$Стандартът като карта$bgt$, 'en', $ttl$The Standard as a Map$ttl$, $bdy$The standard tries to turn a real population into shared language. Its value is important, but cause and effect should not be reversed: the text comes after the dog, not the dog after the text.

A standard is created to describe and protect type. It becomes problematic when it is read as a mechanical formula.

A functional Cane Corso must remain a harmonious animal. Measurements do not exist in isolation. Head, neck, body, limbs, movement, and character must belong to the same organism.

The standard can be read as a map or as an idol.

As a map, it describes a recognized balance and helps breeders avoid losing direction. When it becomes an idol, visible details are easily pushed to extremes simply because they catch the eye.

Dott. Flavio Bruno places the ideal type in the balance between structure, character, aptitude, and temperament.

For every characteristic, we should therefore ask: what is it for, what functional compromise does it represent, and what happens when it is pushed to an extreme?$bdy$),
    ($bgt$Стандартът като карта$bgt$, 'it', $ttl$Lo standard come mappa$ttl$, $bdy$Lo standard prova a trasformare una popolazione reale in un linguaggio condiviso. Il suo valore è importante, ma non bisogna invertire causa ed effetto: il testo viene dopo il cane, non il cane dopo il testo.

Uno standard nasce per descrivere e proteggere il tipo. Diventa problematico quando viene letto come una formula meccanica.

Il Cane Corso funzionale deve rimanere un animale armonico. Le misure non esistono isolate. Testa, collo, corpo, arti, movimento e carattere devono appartenere allo stesso organismo.

Lo standard può essere letto come una mappa o come un idolo.

Come mappa descrive un equilibrio riconosciuto e aiuta chi seleziona a non perdere la direzione. Quando diventa un idolo, i dettagli visibili vengono facilmente spinti agli estremi soltanto perché colpiscono l'occhio.

Il Dott. Flavio Bruno colloca il tipo ideale nell'equilibrio tra struttura, carattere, attitudine e temperamento.

Per ogni caratteristica dovremmo quindi chiederci: a che cosa serve, quale compromesso funzionale rappresenta e che cosa accade quando viene portata all'estremo?$bdy$),
    ($bgt$Майката като първа среда$bgt$, 'en', $ttl$The Mother as the First Environment$ttl$, $bdy$Selection does not begin when we choose a puppy. It begins much earlier, with the choice of the parents and with the mother's ability to carry, deliver, and raise a healthy litter.

A breed is not preserved only through the choice of the stud dog. It is preserved through the mother as well.

A brood bitch is not a genetic container. Health, character, maternal ability, nutrition, stress, and living conditions influence the development of the litter.

In the first days, the question is not which puppy is the “most beautiful.” The responsibility is to give every puppy the best possible conditions in which to develop.

Historical practical advice about pregnancy, birth, colostrum, supplements, and preventive care should not be used as ready-made medical recipes. Diagnosis, medication, and intervention belong to modern veterinary medicine.

The principle that remains is clear: observation, prevention, rapid recognition of problems, and respect for the nature of the process.

The mother does not transmit only genes. She is the puppy's first environment.$bdy$),
    ($bgt$Майката като първа среда$bgt$, 'it', $ttl$La madre come primo ambiente$ttl$, $bdy$La selezione non comincia quando scegliamo un cucciolo. Comincia molto prima, con la scelta dei genitori e con la capacità della madre di portare, partorire e allevare una cucciolata sana.

Una razza non si conserva soltanto attraverso la scelta dello stallone. Si conserva anche attraverso la madre.

Una fattrice non è un contenitore genetico. Salute, carattere, capacità materna, alimentazione, stress e condizioni di vita influenzano lo sviluppo della cucciolata.

Nei primi giorni la domanda non è quale cucciolo sia il “più bello”. La responsabilità è dare a tutti le migliori condizioni possibili per svilupparsi.

Le indicazioni pratiche storiche su gravidanza, parto, colostro, integrazione e profilassi non devono essere usate come ricette mediche pronte. Diagnosi, farmaci e interventi appartengono alla medicina veterinaria moderna.

Il principio che rimane è chiaro: osservazione, prevenzione, rapido riconoscimento dei problemi e rispetto della natura del processo.

La madre non trasmette soltanto geni. È il primo ambiente del cucciolo.$bdy$),
    ($bgt$Масерията: мястото, което селектира$bgt$, 'en', $ttl$The Masseria: The Place That Selects$ttl$, $bdy$The masseria changes the way we look at the history of the Cane Corso. Here the dog stops being an abstract historical figure and returns to a real economy, territory, and working day.

The masseria is not merely a building. It is a living system of people, land, livestock, storehouses, roads, tools, food, dangers, and daily rhythms.

In this world, the dog has a precise function and its value is tested every day.

Different tasks can be distributed among different types of dogs. The small vigilant dog gives warning. The large pastoral dog protects the flock. The Cane Corso stays closer to the person, the property, livestock, hunting, and tasks that require mobility and intervention.

This environment cannot afford an uncontrollable dog. Strength has to exist together with control.

The territory also participates in selection: climate, distance, terrain, livestock type, and property size change what is required of the dog.

The masseria does not produce identical photographs. It produces dogs capable of solving the same real problems.$bdy$),
    ($bgt$Масерията: мястото, което селектира$bgt$, 'it', $ttl$La masseria: il luogo che seleziona$ttl$, $bdy$La masseria cambia il modo in cui guardiamo la storia del Cane Corso. Qui il cane smette di essere una figura storica astratta e ritorna dentro un'economia reale, un territorio e una giornata di lavoro.

La masseria non è soltanto un edificio. È un sistema vivente di persone, terra, bestiame, depositi, strade, strumenti, cibo, pericoli e ritmi quotidiani.

In questo mondo il cane ha una funzione precisa e il suo valore viene verificato ogni giorno.

Compiti diversi possono essere distribuiti fra tipi diversi di cani. Il piccolo cane vigile avverte. Il grande cane pastorale protegge la greggia. Il Cane Corso resta più vicino all'uomo, alla proprietà, al bestiame, alla caccia e alle attività che richiedono mobilità e intervento.

Questo ambiente non può permettersi un cane incontrollabile. Forza e controllo devono esistere insieme.

Anche il territorio partecipa alla selezione: clima, distanze, terreno, tipo di bestiame e dimensione della proprietà modificano ciò che viene richiesto al cane.

La masseria non produce fotografie identiche. Produce cani capaci di risolvere gli stessi problemi reali.$bdy$)
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
