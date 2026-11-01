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
    ('health_care', $ttl$Демодекоза: когато нормалният акар стане проблем$ttl$, $bdy$Demodex акарите могат да присъстват в малък брой в космените фоликули на здрави кучета без да причиняват заболяване. Демодекозата се развива, когато броят им се увеличи значително и кожата започне да реагира.

Съществуват локализирана и генерализирана форма. Локализираната по-често се вижда при млади кучета като малки участъци без козина, със зачервяване и лющене. Сърбежът може да е слаб или да липсва.

Генерализираната демодекоза е по-сериозна. Може да има обширен косопад, зачервяване, омазняване, корички, потъмняване на кожата, възпаление на лапите и вторична бактериална инфекция. При тежки случаи са възможни температура, отпадналост и увеличени лимфни възли.

Диагнозата обикновено се поставя чрез дълбоко кожно остъргване или изследване на косми. При генерализирана форма при възрастно куче ветеринарят може да търси и основно заболяване, което потиска имунната система.

Демодекозата по правило не се счита за заразна между възрастни кучета. При млади кучета има данни за наследствена предразположеност към генерализирана форма, затова развъдните решения трябва да се обсъждат отговорно.

Превенцията не се изчерпва с външно обезпаразитяване. Важни са общото здраве, избягването на ненужно имуносупресивно лечение и търсенето на основно заболяване при възрастни кучета с генерализирана форма.

Бързо разпространяващи се лезии, гной, силна болезненост, температура, отпадналост или обширно засягане на лапите изискват ветеринарна оценка.

Този материал е образователен и не замества кожно изследване, ветеринарна диагноза или индивидуално лечение.$bdy$),
    ('health_care', $ttl$Саркоптична краста: силен сърбеж и заразност$ttl$, $bdy$Саркоптичната краста се причинява от Sarcoptes scabiei и е силно заразно паразитно кожно заболяване. Предава се най-често при близък контакт между животни и може временно да предизвика сърбящи кожни лезии и при хора.

Най-характерният симптом е силният сърбеж. Могат да се появят зачервяване, корички, лющене, косопад и разраняване от постоянно чесане. Често се засягат ушните ръбове, лактите, коремът и долните части на тялото, но заболяването може да се разпространи широко.

Кожните остъргвания невинаги откриват акарите, затова отрицателният резултат не изключва напълно заболяването. Ветеринарят оценява историята, клиничните признаци, изследванията и понякога отговора на подходящо лечение.

Профилактиката включва избягване на контакт с болни или съмнителни животни, контрол на паразитите според ветеринарна препоръка и едновременно обсъждане на всички контактни животни в дома при потвърден случай.

Тъй като заболяването е заразно, легла, одеяла и други често използвани предмети трябва да бъдат управлявани според ветеринарните указания, за да се намали повторното излагане.

Не лекувайте произволно със селскостопански или концентрирани инсектицидни продукти. Неподходящите препарати могат да бъдат токсични.

Много силен сърбеж, разраняване, вторична инфекция, отпадналост или бързо разпространение на лезиите изискват ветеринарен преглед.

Този материал е образователен и не замества ветеринарна диагноза или индивидуална противопаразитна програма.$bdy$),
    ('health_care', $ttl$Пиодермия: бактериалната инфекция често е вторична$ttl$, $bdy$Пиодермия означава гнойна бактериална инфекция на кожата. При кучетата тя често е вторична на друг проблем, например алергия, паразити, кожна травма или друго заболяване, което нарушава нормалната кожна бариера.

При повърхностна пиодермия могат да се виждат зачервяване, лющене, малки пъпчици или пустули, корички, кръгли участъци с косопад и сърбеж с различна сила. При късокосмести кучета лезиите понякога изглеждат като множество малки подутини.

Дълбоката пиодермия е по-сериозна и може да причини болезненост, подуване, язви, неприятна миризма, кървене и отделяне на гной. Междупръстните пространства, брадичката, лактите и други натоварени или влажни участъци могат да бъдат особено уязвими.

Диагнозата не трябва да се поставя само по външния вид. Цитологията е важен метод за доказване на бактерии и възпалителни клетки. При дълбоки, рецидивиращи или нетипични инфекции може да е необходимо бактериално посяване и тест за чувствителност.

Истинската профилактика означава да се търси и контролира основната причина. Ако алергия, Demodex, бълхи или друг фактор остане нелекуван, пиодермията може да се връща.

Не започвайте произволно антибиотици и не прекъсвайте предписано лечение само защото кожата изглежда по-добре. Неправилната употреба на антибиотици увеличава риска от резистентност.

Дълбоки болезнени лезии, гной, силна миризма, температура, отпадналост или бързо разпространение изискват ветеринарен преглед.

Този материал е образователен и не замества цитология, бактериално изследване, ветеринарна диагноза или индивидуално лечение.$bdy$),
    ('health_care', $ttl$Дерматофитоза: гъбична инфекция, която може да се предава$ttl$, $bdy$Дерматофитозата, често наричана ringworm, е повърхностна гъбична инфекция на кожата и космите. Тя не се причинява от червей.

При кучетата могат да се появят кръгли или неправилни участъци с косопад, лющене, корички, зачервяване, малки папули и понякога сърбеж. Някои лезии могат да бъдат възпалени или възловидни и да приличат на други кожни заболявания.

Диагнозата не трябва да се поставя само по формата на лезията. Ветеринарят може да използва директно микроскопско изследване на косми и люспи, гъбична култура, PCR и в определени случаи лампа на Wood като помощен инструмент.

Дерматофитозата може да се предава между животни и хора. Това означава, че при потвърден случай трябва да се мисли и за контактните животни, хората в дома и замърсяването на околната среда.

Профилактиката включва добра хигиена, избягване на споделяне на замърсени четки, постелки и принадлежности и внимателно управление на средата при потвърдено заболяване. Особено внимание е нужно при деца, възрастни хора и лица с отслабена имунна система.

Не използвайте произволни човешки противогъбични кремове върху кучето без ветеринарна препоръка. Част от случаите изискват комбиниран подход към животното и околната среда.

Бързо разпространяващи се лезии, силно възпаление, гной, засягане на много животни или кожни лезии при хора в дома са причина за ветеринарна и при нужда медицинска консултация.

Този материал е образователен и не замества лабораторна диагностика, ветеринарен преглед или медицинска консултация при хора.$bdy$)
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
        'USG Editorial · Skin & Coat · Knowledge Content Pack 09',
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
          'source', 'USG Editorial Skin & Coat',
          'pack', 'KNOWLEDGE_CONTENT_PACK_09',
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
        moderation_note = 'USG Editorial · Skin & Coat · Knowledge Content Pack 09',
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
          'source', 'USG Editorial Skin & Coat',
          'pack', 'KNOWLEDGE_CONTENT_PACK_09',
          'category', item.category_key
        )
      );
    end if;
  end loop;
end
$$;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Демодекоза: когато нормалният акар стане проблем$bgt$, 'en', $ttl$Demodicosis: When a Normal Mite Becomes a Problem$ttl$, $bdy$Demodex mites can exist in small numbers in the hair follicles of healthy dogs without causing disease. Demodicosis develops when mite numbers increase substantially and the skin begins to react.

There are localized and generalized forms. Localized disease is seen more often in young dogs as small areas of hair loss with redness and scaling. Itching may be mild or absent.

Generalized demodicosis is more serious. It can cause widespread hair loss, redness, oily skin, crusting, hyperpigmentation, inflammation of the feet, and secondary bacterial infection. Severe cases may be accompanied by fever, lethargy, and enlarged lymph nodes.

Diagnosis is usually made with deep skin scrapings or examination of plucked hairs. In an adult dog with generalized disease, the veterinarian may also investigate an underlying condition that suppresses the immune system.

Demodicosis is generally not considered contagious between adult dogs. There is evidence of hereditary predisposition to juvenile generalized disease, so breeding decisions should be approached responsibly.

Prevention is not simply a matter of routine external parasite control. General health, avoidance of unnecessary immunosuppression, and investigation for underlying disease in adult-onset generalized cases are important.

Rapidly spreading lesions, pus, marked pain, fever, lethargy, or extensive foot involvement require veterinary assessment.

This material is educational and does not replace skin testing, veterinary diagnosis, or individualized treatment.$bdy$),
    ($bgt$Демодекоза: когато нормалният акар стане проблем$bgt$, 'it', $ttl$Demodicosi: quando un acaro normale diventa un problema$ttl$, $bdy$Gli acari Demodex possono essere presenti in piccolo numero nei follicoli piliferi dei cani sani senza causare malattia. La demodicosi si sviluppa quando il numero degli acari aumenta notevolmente e la cute inizia a reagire.

Esistono forme localizzate e generalizzate. La forma localizzata si osserva più spesso nei cani giovani come piccole aree di alopecia con arrossamento e desquamazione. Il prurito può essere lieve o assente.

La demodicosi generalizzata è più seria. Può causare perdita di pelo diffusa, eritema, cute oleosa, croste, iperpigmentazione, infiammazione delle zampe e infezioni batteriche secondarie. Nei casi gravi possono comparire febbre, abbattimento e linfonodi aumentati.

La diagnosi viene generalmente effettuata mediante raschiati cutanei profondi o esame dei peli. In un cane adulto con forma generalizzata, il veterinario può inoltre cercare una malattia sottostante che deprima il sistema immunitario.

La demodicosi non è generalmente considerata contagiosa tra cani adulti. Esistono evidenze di predisposizione ereditaria nella forma generalizzata giovanile, quindi le decisioni riproduttive devono essere affrontate responsabilmente.

La prevenzione non consiste semplicemente nel normale controllo dei parassiti esterni. Sono importanti lo stato generale di salute, evitare immunosoppressione non necessaria e ricercare eventuali patologie sottostanti nelle forme generalizzate dell'adulto.

Lesioni che si diffondono rapidamente, pus, dolore marcato, febbre, abbattimento o esteso coinvolgimento delle zampe richiedono una valutazione veterinaria.

Questo materiale è educativo e non sostituisce esami cutanei, diagnosi veterinaria o trattamento individuale.$bdy$),
    ($bgt$Саркоптична краста: силен сърбеж и заразност$bgt$, 'en', $ttl$Sarcoptic Mange: Severe Itching and Contagion$ttl$, $bdy$Sarcoptic mange is caused by Sarcoptes scabiei and is a highly contagious parasitic skin disease. It is most commonly transmitted through close animal-to-animal contact and can temporarily cause itchy skin lesions in people.

The most characteristic sign is intense itching. Redness, crusting, scaling, hair loss, and self-trauma from persistent scratching may occur. The ear margins, elbows, abdomen, and lower body are commonly affected, but disease can become widespread.

Skin scrapings do not always reveal the mites, so a negative result does not completely exclude the disease. The veterinarian evaluates history, clinical signs, diagnostic findings, and sometimes the response to appropriate treatment.

Prevention includes avoiding contact with affected or suspicious animals, using parasite control according to veterinary advice, and considering all contact animals in the household when a case is confirmed.

Because the disease is contagious, bedding, blankets, and other frequently used items should be managed according to veterinary guidance to reduce repeated exposure.

Do not treat randomly with agricultural or concentrated insecticidal products. Inappropriate products can be toxic.

Extreme itching, open wounds, secondary infection, lethargy, or rapid spread of lesions requires veterinary assessment.

This material is educational and does not replace veterinary diagnosis or an individualized parasite-control program.$bdy$),
    ($bgt$Саркоптична краста: силен сърбеж и заразност$bgt$, 'it', $ttl$Rogna sarcoptica: forte prurito e contagiosità$ttl$, $bdy$La rogna sarcoptica è causata da Sarcoptes scabiei ed è una malattia cutanea parassitaria altamente contagiosa. Si trasmette soprattutto attraverso il contatto diretto tra animali e può provocare temporaneamente lesioni pruriginose anche nell'uomo.

Il segno più caratteristico è il prurito intenso. Possono comparire arrossamento, croste, desquamazione, alopecia e lesioni da autotraumatismo dovute al continuo grattamento. Sono spesso interessati margini auricolari, gomiti, addome e parti inferiori del corpo, ma la malattia può diventare diffusa.

I raschiati cutanei non sempre evidenziano gli acari, quindi un risultato negativo non esclude completamente la malattia. Il veterinario valuta anamnesi, segni clinici, risultati diagnostici e talvolta la risposta a un trattamento appropriato.

La prevenzione comprende evitare il contatto con animali malati o sospetti, utilizzare il controllo antiparassitario secondo indicazione veterinaria e considerare tutti gli animali conviventi quando viene confermato un caso.

Poiché la malattia è contagiosa, cucce, coperte e altri oggetti frequentemente utilizzati devono essere gestiti secondo le indicazioni veterinarie per ridurre la riesposizione.

Non utilizzare casualmente prodotti agricoli o insetticidi concentrati. Prodotti inappropriati possono essere tossici.

Prurito estremo, ferite aperte, infezione secondaria, abbattimento o rapida diffusione delle lesioni richiedono una valutazione veterinaria.

Questo materiale è educativo e non sostituisce la diagnosi veterinaria o un programma antiparassitario individuale.$bdy$),
    ($bgt$Пиодермия: бактериалната инфекция често е вторична$bgt$, 'en', $ttl$Pyoderma: Bacterial Skin Infection Is Often Secondary$ttl$, $bdy$Pyoderma means a purulent bacterial infection of the skin. In dogs, it is often secondary to another problem such as allergy, parasites, skin trauma, or another disease that disrupts the normal skin barrier.

Superficial pyoderma may cause redness, scaling, small papules or pustules, crusts, circular areas of hair loss, and variable itching. In short-coated dogs, lesions can sometimes look like multiple small raised bumps.

Deep pyoderma is more serious and can cause pain, swelling, ulcers, unpleasant odor, bleeding, and discharge of pus. Interdigital spaces, the chin, elbows, and other moist or pressure-prone areas can be particularly vulnerable.

Diagnosis should not be based on appearance alone. Cytology is an important method for demonstrating bacteria and inflammatory cells. Deep, recurrent, or unusual infections may require bacterial culture and antimicrobial susceptibility testing.

True prevention means identifying and controlling the underlying cause. If allergy, Demodex, fleas, or another contributing factor remains uncontrolled, pyoderma may recur.

Do not start antibiotics randomly, and do not stop prescribed treatment simply because the skin looks better. Inappropriate antibiotic use increases the risk of antimicrobial resistance.

Deep painful lesions, pus, strong odor, fever, lethargy, or rapid spread require veterinary examination.

This material is educational and does not replace cytology, bacterial testing, veterinary diagnosis, or individualized treatment.$bdy$),
    ($bgt$Пиодермия: бактериалната инфекция често е вторична$bgt$, 'it', $ttl$Piodermite: l'infezione batterica cutanea è spesso secondaria$ttl$, $bdy$Piodermite significa infezione batterica purulenta della cute. Nel cane è spesso secondaria a un altro problema come allergia, parassiti, trauma cutaneo o un'altra malattia che altera la normale barriera cutanea.

La piodermite superficiale può causare arrossamento, desquamazione, piccole papule o pustole, croste, aree circolari di alopecia e prurito di intensità variabile. Nei cani a pelo corto le lesioni possono talvolta sembrare numerosi piccoli rilievi.

La piodermite profonda è più seria e può provocare dolore, gonfiore, ulcere, cattivo odore, sanguinamento e fuoriuscita di pus. Gli spazi interdigitali, il mento, i gomiti e altre aree umide o soggette a pressione possono essere particolarmente vulnerabili.

La diagnosi non dovrebbe basarsi soltanto sull'aspetto. La citologia è un metodo importante per dimostrare batteri e cellule infiammatorie. Le infezioni profonde, ricorrenti o insolite possono richiedere coltura batterica e test di sensibilità agli antimicrobici.

La vera prevenzione significa identificare e controllare la causa sottostante. Se allergia, Demodex, pulci o un altro fattore predisponente rimane incontrollato, la piodermite può recidivare.

Non iniziare antibiotici casualmente e non interrompere una terapia prescritta soltanto perché la cute sembra migliorata. L'uso inappropriato di antibiotici aumenta il rischio di resistenza antimicrobica.

Lesioni profonde e dolorose, pus, forte odore, febbre, abbattimento o rapida diffusione richiedono una visita veterinaria.

Questo materiale è educativo e non sostituisce citologia, esami batteriologici, diagnosi veterinaria o trattamento individuale.$bdy$),
    ($bgt$Дерматофитоза: гъбична инфекция, която може да се предава$bgt$, 'en', $ttl$Dermatophytosis: A Fungal Infection That Can Spread$ttl$, $bdy$Dermatophytosis, commonly called ringworm, is a superficial fungal infection of the skin and hair. It is not caused by a worm.

Dogs may develop circular or irregular areas of hair loss, scaling, crusting, redness, small papules, and sometimes itching. Some lesions can become inflamed or nodular and may resemble other skin diseases.

Diagnosis should not be based only on the shape of a lesion. A veterinarian may use direct microscopic examination of hairs and scales, fungal culture, PCR, and in selected cases a Wood's lamp as an aid.

Dermatophytosis can spread between animals and people. This means that confirmed cases require consideration of contact animals, people in the household, and environmental contamination.

Prevention includes good hygiene, avoiding shared contaminated brushes, bedding, and equipment, and careful environmental management when infection is confirmed. Particular care is appropriate around children, older adults, and immunocompromised people.

Do not use random human antifungal creams on a dog without veterinary advice. Some cases require a coordinated approach to both the animal and the environment.

Rapidly spreading lesions, severe inflammation, pus, involvement of multiple animals, or skin lesions developing in people in the household are reasons for veterinary and, when appropriate, medical consultation.

This material is educational and does not replace laboratory diagnosis, veterinary examination, or medical consultation for people.$bdy$),
    ($bgt$Дерматофитоза: гъбична инфекция, която може да се предава$bgt$, 'it', $ttl$Dermatofitosi: un'infezione fungina che può diffondersi$ttl$, $bdy$La dermatofitosi, comunemente chiamata tigna, è un'infezione fungina superficiale della cute e del pelo. Non è causata da un verme.

Nei cani possono comparire aree circolari o irregolari di alopecia, desquamazione, croste, arrossamento, piccole papule e talvolta prurito. Alcune lesioni possono essere infiammate o nodulari e assomigliare ad altre malattie cutanee.

La diagnosi non dovrebbe basarsi soltanto sulla forma della lesione. Il veterinario può utilizzare l'esame microscopico diretto di peli e squame, coltura fungina, PCR e, in casi selezionati, la lampada di Wood come supporto.

La dermatofitosi può diffondersi tra animali e persone. Un caso confermato richiede quindi attenzione agli animali conviventi, alle persone della famiglia e alla contaminazione ambientale.

La prevenzione comprende buona igiene, evitare la condivisione di spazzole, cucce e attrezzature contaminate e una gestione accurata dell'ambiente quando l'infezione è confermata. È necessaria particolare attenzione con bambini, anziani e persone immunodepresse.

Non utilizzare casualmente creme antimicotiche per uso umano sul cane senza consiglio veterinario. Alcuni casi richiedono un approccio coordinato sia sull'animale sia sull'ambiente.

Lesioni in rapida diffusione, forte infiammazione, pus, coinvolgimento di più animali o comparsa di lesioni cutanee nelle persone della famiglia richiedono consulto veterinario e, quando necessario, medico.

Questo materiale è educativo e non sostituisce diagnosi di laboratorio, visita veterinaria o consulto medico per le persone.$bdy$)
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
