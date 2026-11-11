create table if not exists public.knowledge_content_translations (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  language text not null check (language in ('bg', 'en', 'it')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (content_item_id, language)
);

alter table public.knowledge_content_translations enable row level security;

revoke all on public.knowledge_content_translations from anon;
revoke all on public.knowledge_content_translations from authenticated;

create or replace function public.list_public_knowledge_items_v3(
  target_category text default null,
  target_language text default 'bg'
)
returns table (
  id uuid,
  content_type text,
  title text,
  body text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ci.id,
    ci.content_type,
    case
      when coalesce(target_language, 'bg') = 'bg' then ci.title
      else coalesce(kt.title, ci.title)
    end as title,
    case
      when coalesce(target_language, 'bg') = 'bg' then ci.body
      else coalesce(kt.body, ci.body)
    end as body,
    ci.updated_at
  from public.content_items ci
  left join public.knowledge_content_translations kt
    on kt.content_item_id = ci.id
   and kt.language = case
     when coalesce(target_language, 'bg') in ('en', 'it') then target_language
     else 'bg'
   end
  where ci.section_key = 'knowledge'
    and ci.status = 'approved'
    and (
      target_category is null
      or coalesce(nullif(trim(ci.context_type), ''), 'basics') = target_category
    )
  order by ci.updated_at desc, ci.id desc;
$$;

revoke all on function public.list_public_knowledge_items_v3(text, text) from public;
grant execute on function public.list_public_knowledge_items_v3(text, text) to anon;
grant execute on function public.list_public_knowledge_items_v3(text, text) to authenticated;

with source(bg_title, language, translated_title, translated_body) as (
  values
    ($bgt$Анатомия и структура$bgt$, 'en', $ttl$Anatomy and Structure$ttl$, $bdy$The Cane Corso, like every dog, can be understood through the main regions of the body: head, neck, trunk, pelvis, forelimbs, hindlimbs, and paws.

The musculoskeletal system includes bones, joints, muscles, tendons, and ligaments. These structures work together to support the body, provide stability, and allow movement.

The skeleton includes the skull, vertebral column, rib cage, and the bones of the limbs. Muscles support posture, weight bearing, and locomotion. Joints determine direction and range of movement, while the paws contribute to support, traction, balance, and shock absorption.

The head includes the skull, lower jaw, nasal region, muzzle, orbits, and chewing muscles. These structures are connected with the senses, feeding, and orientation.

Normal movement results from the coordinated work of all these elements.

This material is educational. It provides general anatomical orientation and should not be used as a diagnostic or veterinary scheme.$bdy$),
    ($bgt$Анатомия и структура$bgt$, 'it', $ttl$Anatomia e struttura$ttl$, $bdy$Il Cane Corso, come ogni cane, può essere compreso attraverso le principali regioni del corpo: testa, collo, tronco, bacino, arti anteriori, arti posteriori e zampe.

L'apparato muscolo-scheletrico comprende ossa, articolazioni, muscoli, tendini e legamenti. Queste strutture lavorano insieme per sostenere il corpo, garantire stabilità e permettere il movimento.

Lo scheletro comprende cranio, colonna vertebrale, gabbia toracica e ossa degli arti. La muscolatura sostiene la postura, il carico e la locomozione. Le articolazioni determinano direzione e ampiezza del movimento, mentre le zampe contribuiscono ad appoggio, aderenza, equilibrio e assorbimento degli urti.

La testa comprende cranio, mandibola, regione nasale, muso, orbite e muscolatura masticatoria. Queste strutture sono collegate ai sensi, all'alimentazione e all'orientamento.

Il movimento normale è il risultato del lavoro coordinato di tutti questi elementi.

Questo materiale ha finalità educative. Offre un orientamento anatomico generale e non deve essere usato come schema diagnostico o veterinario.$bdy$),
    ($bgt$Преди породата$bgt$, 'en', $ttl$Before the Breed$ttl$, $bdy$Before the breed there was the dog. Before the pedigree there was necessity.

To understand the origin of a functional dog, it is often more useful to ask why people needed that kind of animal than to search for a modern breed name in the distant past.

Guarding, hunting, protection, livestock control, and work around the farmstead shaped expectations. Structure, character, movement, and behavior were selected because they had to answer a task.

Work therefore acted as a form of selection. The practical question was not whether the dog matched a written standard, but whether it could do the job.

Powerful dogs are documented in many ancient contexts, but images, names, and similarities do not prove a direct genealogical line to the modern Cane Corso. A sequence such as Mesopotamia → Epirus → Rome → Cane Corso should not be presented as established descent.

Needs can persist longer than bloodlines, names, or political borders. Similar functions can repeatedly favor similar traits.

The central principle is simple: form does not come before function. Function creates the conditions in which a type can emerge and be preserved.$bdy$),
    ($bgt$Преди породата$bgt$, 'it', $ttl$Prima della razza$ttl$, $bdy$Prima della razza c'era il cane. Prima del pedigree c'era la necessità.

Per comprendere l'origine di un cane funzionale è spesso più utile chiedersi perché l'uomo avesse bisogno di un animale di quel tipo, invece di cercare il nome moderno di una razza nel passato remoto.

Guardia, caccia, protezione, controllo del bestiame e lavoro nella masseria modellavano le aspettative. Struttura, carattere, movimento e comportamento venivano selezionati perché dovevano rispondere a un compito.

Il lavoro agiva quindi come forma di selezione. La domanda pratica non era se il cane corrispondesse a uno standard scritto, ma se fosse capace di svolgere il lavoro.

Cani potenti sono documentati in molti contesti antichi, ma immagini, nomi e somiglianze non provano una linea genealogica diretta fino al Cane Corso moderno. Una sequenza come Mesopotamia → Epiro → Roma → Cane Corso non deve essere presentata come discendenza dimostrata.

Le necessità possono durare più a lungo delle linee di sangue, dei nomi o dei confini politici. Funzioni simili possono favorire più volte caratteristiche simili.

Il principio centrale è semplice: la forma non viene prima della funzione. La funzione crea le condizioni nelle quali un tipo può nascere e conservarsi.$bdy$),
    ($bgt$Функцията създава типа$bgt$, 'en', $ttl$Function Shapes Type$ttl$, $bdy$At the center of this book stands an idea expressed clearly by Dott. Flavio Bruno: function shapes type.

Type is not appearance alone. It is a combination of structure, aptitude, temperament, movement, working ability, and relationship with people.

When selection focuses only on a visible trait, the image may be preserved while the dog itself is gradually lost.

Function puts the dog to the test. It reveals whether structure is useful, movement is efficient, temperament is stable, and the dog can operate in a real environment.

This is not an argument against the standard. A standard can describe and help preserve an already recognized type. But it comes after function, not before it.

The question is therefore not only what the Cane Corso looks like, but which qualities created this type and what happens when function is forgotten.

Function shapes type not as a slogan, but as a rule for understanding the breed.$bdy$),
    ($bgt$Функцията създава типа$bgt$, 'it', $ttl$La funzione fa il tipo$ttl$, $bdy$Al centro di questo libro c'è un'idea espressa con chiarezza dal Dott. Flavio Bruno: la funzione fa il tipo.

Il tipo non è soltanto apparenza. È una combinazione di struttura, attitudine, temperamento, movimento, capacità di lavoro e rapporto con l'uomo.

Quando la selezione si concentra soltanto su un tratto visibile, l'immagine può essere conservata mentre il cane, poco a poco, viene perduto.

La funzione mette il cane alla prova. Mostra se la struttura è utile, se il movimento è efficiente, se il temperamento è stabile e se il cane sa operare in un ambiente reale.

Non è un argomento contro lo standard. Uno standard può descrivere e aiutare a conservare un tipo già riconosciuto. Ma viene dopo la funzione, non prima.

La domanda quindi non è soltanto come appare il Cane Corso, ma quali qualità hanno creato questo tipo e che cosa accade quando la funzione viene dimenticata.

La funzione fa il tipo non come slogan, ma come regola per comprendere la razza.$bdy$),
    ($bgt$Растеж без форсиране$bgt$, 'en', $ttl$Growth Without Forcing$ttl$, $bdy$Growth tests our patience. A large young dog easily creates the desire for mass and early development, but biological timing cannot be accelerated without consequences.

A Cane Corso puppy grows quickly. That is precisely why growth should not be forced.

Bones, joints, muscles, and metabolism need to develop in balance. A young dog that is too heavy is not necessarily stronger; it may simply place greater load on a developing musculoskeletal system.

Physical and mental development do not always progress at the same speed. An impressive body may still belong to a youngster that is learning self-control, trust, and a stable relationship with people.

Growth is not a race toward mass. The goal is a healthy, mobile, and balanced dog.

The Cane Corso must be given time to become Cane Corso.$bdy$),
    ($bgt$Растеж без форсиране$bgt$, 'it', $ttl$Crescita senza forzature$ttl$, $bdy$La crescita mette alla prova la nostra pazienza. Un grande cane giovane crea facilmente il desiderio di massa e precocità, ma i tempi biologici non possono essere accelerati senza conseguenze.

Un cucciolo di Cane Corso cresce rapidamente. Proprio per questo la crescita non deve essere forzata.

Ossa, articolazioni, muscoli e metabolismo devono svilupparsi in equilibrio. Un giovane troppo pesante non è necessariamente più forte; può semplicemente caricare di più un apparato muscolo-scheletrico ancora in sviluppo.

Lo sviluppo fisico e quello mentale non procedono sempre alla stessa velocità. Un corpo imponente può appartenere ancora a un giovane che sta imparando autocontrollo, fiducia e una relazione stabile con l'uomo.

La crescita non è una corsa verso la massa. L'obiettivo è un cane sano, mobile ed equilibrato.

Il Cane Corso deve avere il tempo di diventare Cane Corso.$bdy$),
    ($bgt$Хранене: традиция и съвременна отговорност$bgt$, 'en', $ttl$Nutrition: Tradition and Modern Responsibility$ttl$, $bdy$Nutrition occupies an important place in Dott. Flavio Bruno's material: colostrum, nursing, weaning, meat, fats, cereals, and rural practices.

These accounts are valuable as cultural memory, but they should not automatically become a feeding plan for the modern Cane Corso.

For young large-breed dogs, the basic principle is growth supported by complete and balanced food appropriate to the stage of development, without pursuing excessive body mass.

Supplements are not automatically beneficial. When a diet is already complete, additional minerals or vitamins should have a clear reason and professional evaluation.

Home-prepared, raw, and other unconventional diets should be assessed for nutritional adequacy and safety.

Tradition can tell us how dogs were fed in the past. Modern responsibility requires feeding today to follow current veterinary and nutritional knowledge.

This material is educational and does not replace individual veterinary or nutritional advice.$bdy$),
    ($bgt$Хранене: традиция и съвременна отговорност$bgt$, 'it', $ttl$Alimentazione: tradizione e responsabilità moderna$ttl$, $bdy$L'alimentazione occupa un posto importante nei materiali del Dott. Flavio Bruno: colostro, allattamento, svezzamento, carne, grassi, cereali e pratiche rurali.

Questi racconti sono preziosi come memoria culturale, ma non devono trasformarsi automaticamente in un piano alimentare per il Cane Corso moderno.

Per i giovani cani di taglia grande, il principio di base è una crescita sostenuta da un alimento completo e bilanciato, adatto alla fase di sviluppo, senza inseguire una massa corporea eccessiva.

Gli integratori non sono automaticamente utili. Quando una dieta è già completa, minerali o vitamine aggiuntivi devono avere una motivazione chiara e una valutazione professionale.

Le diete casalinghe, crude e altri regimi non convenzionali devono essere valutati per adeguatezza nutrizionale e sicurezza.

La tradizione può raccontarci come venivano alimentati i cani in passato. La responsabilità moderna richiede che l'alimentazione di oggi segua le conoscenze veterinarie e nutrizionali aggiornate.

Questo materiale è educativo e non sostituisce una consulenza veterinaria o nutrizionale individuale.$bdy$),
    ($bgt$Обучението следва функцията$bgt$, 'en', $ttl$Training Follows Function$ttl$, $bdy$The history of the working dog shows that training was never separate from purpose.

When people assign a specific task, they begin to seek and develop the qualities that allow the dog to perform it: attention to the environment, control, stability, response to signals, and the ability to work with people.

Historical accounts contain examples of specialization and training, but not every detail has the same documentary support. The more important principle is that function determines which abilities need to be developed.

With the modern Cane Corso, training should not become a demonstration of force. It should build understandable communication, self-control, predictability, and trust.

A powerful dog needs clear boundaries and consistency, but also a relationship with the person guiding it.

The goal is not simply obedience to a command, but the ability to live in a stable and controllable way in the real world.$bdy$),
    ($bgt$Обучението следва функцията$bgt$, 'it', $ttl$L'addestramento segue la funzione$ttl$, $bdy$La storia del cane da lavoro mostra che l'addestramento non è mai stato separato dalla funzione.

Quando l'uomo assegna un compito preciso, inizia a cercare e sviluppare le qualità che permettono al cane di svolgerlo: attenzione all'ambiente, controllo, stabilità, risposta ai segnali e capacità di lavorare accanto all'uomo.

I racconti storici contengono esempi di specializzazione e addestramento, ma non ogni dettaglio possiede la stessa base documentale. Il principio più importante è che la funzione determina quali capacità devono essere sviluppate.

Nel Cane Corso moderno, l'addestramento non dovrebbe diventare una dimostrazione di forza. Dovrebbe costruire comunicazione comprensibile, autocontrollo, prevedibilità e fiducia.

Un cane potente ha bisogno di limiti chiari e coerenza, ma anche di una relazione con la persona che lo guida.

L'obiettivo non è semplicemente obbedire a un comando, ma saper vivere in modo stabile e controllabile nel mondo reale.$bdy$),
    ($bgt$Баланс, характер и темперамент$bgt$, 'en', $ttl$Balance, Character and Temperament$ttl$, $bdy$In the Cane Corso, type cannot be reduced to form alone.

Dott. Flavio Bruno emphasizes an ideal type as a balance between structure, character, working aptitude, and temperament.

Behavior is therefore not an addition to appearance. It is part of the identity of a functional dog.

A stable dog should be able to read the environment, distinguish ordinary from unusual situations, and react without unnecessary chaos.

Courage is not uncontrolled reactivity. Strength is not constant confrontation. Good nervous stability allows the dog to remain manageable and predictable even when the environment changes.

The relationship with people, living conditions, social experience, and training influence how natural qualities are expressed.

When we speak about preserving the Cane Corso, we should preserve not only the image of the breed, but also its balance.$bdy$),
    ($bgt$Баланс, характер и темперамент$bgt$, 'it', $ttl$Equilibrio, carattere e temperamento$ttl$, $bdy$Nel Cane Corso il tipo non può essere ridotto soltanto alla forma.

Il Dott. Flavio Bruno insiste sul tipo ideale come equilibrio tra struttura, carattere, attitudine al lavoro e temperamento.

Il comportamento quindi non è un'aggiunta all'aspetto. Fa parte dell'identità del cane funzionale.

Un cane stabile dovrebbe saper leggere l'ambiente, distinguere le situazioni normali da quelle insolite e reagire senza caos inutile.

Il coraggio non è reattività incontrollata. La forza non è confronto permanente. Una buona stabilità nervosa permette al cane di restare gestibile e prevedibile anche quando l'ambiente cambia.

Il rapporto con l'uomo, le condizioni di vita, l'esperienza sociale e l'addestramento influenzano il modo in cui le qualità naturali si esprimono.

Quando parliamo di conservare il Cane Corso, dovremmo conservare non soltanto l'immagine della razza, ma anche il suo equilibrio.$bdy$),
    ($bgt$Предотвратяване преди лечение$bgt$, 'en', $ttl$Prevention Before Treatment$ttl$, $bdy$Health does not begin with treatment after a problem has already appeared.

Prevention means observation, sensible preventive care, appropriate nutrition, movement, body-condition control, and timely veterinary attention.

Modern medicine offers tools that previous generations did not have: diagnostics, screening, vaccination, parasite prevention, reproductive medicine, and a better understanding of inherited risks.

Tradition has value, but it does not replace evidence. When medical knowledge changes, care should change with it.

Responsible breeding is also part of health. A problem should not be hidden simply because a dog is beautiful, famous, or valuable.

Quality of life, mental well-being, and physical health are connected.

This material is educational. Specific preventive schedules, diagnoses, medications, and interventions should be determined by a veterinarian for the individual animal and according to current guidance.$bdy$),
    ($bgt$Предотвратяване преди лечение$bgt$, 'it', $ttl$Prevenire prima di curare$ttl$, $bdy$La salute non comincia con la cura quando il problema è già comparso.

Prevenire significa osservazione, profilassi ragionevole, alimentazione adeguata, movimento, controllo della condizione corporea e assistenza veterinaria tempestiva.

La medicina moderna offre strumenti che le generazioni precedenti non avevano: diagnostica, screening, vaccinazioni, prevenzione dei parassiti, medicina riproduttiva e una migliore comprensione dei rischi ereditari.

La tradizione ha valore, ma non sostituisce l'evidenza. Quando le conoscenze mediche cambiano, anche la cura deve cambiare.

L'allevamento responsabile fa parte della salute. Un problema non dovrebbe essere nascosto soltanto perché un cane è bello, famoso o prezioso.

Qualità della vita, benessere mentale e salute fisica sono collegati.

Questo materiale è educativo. Programmi preventivi specifici, diagnosi, farmaci e interventi devono essere stabiliti da un veterinario per il singolo animale e secondo le indicazioni aggiornate.$bdy$)
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
