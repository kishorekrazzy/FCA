import type { Course } from '../types'

export const courses: Course[] = [
  {
    slug: 'learn-how-to-learn',
    title: 'Learn How to Learn Anything',
    category: 'Foundations',
    difficulty: 'Beginner',
    duration: '1h 45m',
    subtitle: 'Eight short lessons on how your brain actually gets better at anything.',
    description: "A practical, story-driven course on the real mechanics of learning — mindset, memory, practice, and habits — narrated through Ren, a curious learner who has struggled and succeeded across languages, code, music, and fitness. By the end, you won't just know facts about learning. You'll have a repeatable system for picking up any skill you want.",
    color: '#6871FA',
    art: 'orbit',
    featured: true,
    tagline: 'Learning is a skill you can learn.',
    skills: ['Growth mindset', 'Memory & recall', 'Deliberate practice', 'Habit design', 'Metacognition'],
    tools: ['Notebook', 'Spaced-repetition app', 'A timer'],
    modules: [
      {
        title: 'The Mind',
        lessons: [
          {
            slug: 'the-mindset-shift',
            title: "The Mindset Shift — \"I'm Not Good at This... Yet\"",
            duration: '11 min',
            xp: 25,
            eyebrow: 'Module 01 / Mindset',
            lead: "There are two words that quietly decide whether you get better at something or give up on it. This lesson is about finding the second one.",
            sections: [
              {
                title: 'Two Kinds of Sentences',
                body: "There's a sentence almost everyone says at least once a week: \"I'm just not good at this.\" It sounds harmless, even a little humble. But it's one of the most quietly destructive sentences a person can say about themselves, because it isn't really describing a skill. It's describing an identity. It says: this is simply who I am, full stop, nothing to be done about it.\n\nNow compare it to a different sentence: \"I'm not good at this yet.\" One word longer. But that single word turns a locked door into a door with a keyhole. \"Yet\" doesn't promise that the next attempt will be easy. It just promises the door isn't sealed shut.\n\nPsychologists have a name for these two ways of thinking. A fixed mindset treats ability as something you're handed at birth — you either have \"the music gene\" or you don't, you're either \"a numbers person\" or you're not. A growth mindset treats ability as something you build, the same way you'd build a muscle: slowly, through repeated use, with soreness along the way and no shortcuts around it.",
              },
              {
                title: 'Why One Word Changes Your Behavior',
                body: "Here's why this matters more than it sounds like it should. Your mindset doesn't just change how you feel about a skill — it actively changes what you do the next time you fail at it.\n\nIf you believe ability is fixed, every mistake feels like evidence. A wrong note, a clumsy sentence in a new language, a bug you can't find — each one quietly confirms the label you'd already given yourself. And if failure is only ever confirming what you already suspected, the sensible move is to stop collecting more proof against yourself. So you quit, and it feels like common sense, not defeat.\n\nBut if you believe ability is built, the exact same mistake means something completely different. It's not a verdict on who you are. It's a data point — information about what to adjust next time. And because it doesn't cost you anything emotionally, you keep going. Not because you're more disciplined than the person who quit, but because failure simply stopped feeling dangerous.",
              },
              {
                title: 'Same Class, Two Guitars, Very Different Endings',
                body: "Picture two students walking into the exact same beginner guitar class. Same teacher, same first chord, same six strings that all feel too tight under soft fingertips.\n\nIn week one, both of them try to play a clean G chord and it buzzes, mutes, and sounds nothing like the recording. Student A puts the guitar down that night and says, out loud, \"I guess I'm just not musical.\" They come back to class twice more, then quietly stop showing up.\n\nStudent B has the exact same buzzing, muted chord. But instead of a verdict, they treat it as a puzzle: which finger is touching the wrong string? Is the thumb wrapped too far over the neck? They adjust one finger a few millimeters, try again, adjust again. It still sounds bad — for weeks, honestly. But three months later, only one of those two students can play a full song cleanly. The difference wasn't talent. On day one, they had exactly the same amount of it. The difference was which sentence each of them was quietly telling themselves every time the chord buzzed.",
              },
              {
                title: "Ren's Memory: The Word That Changed Everything",
                body: "I remember staring at my first real line of code like it was written in a language designed specifically to reject me. Semicolons in the wrong place, brackets that never seemed to close where I expected, an error message that might as well have been in hieroglyphics. I closed the laptop that night thinking the quiet, certain thought: I'm just not a tech person.\n\nI said almost exactly that to my mentor a few weeks later, half-joking, half-hoping he'd agree so I could have permission to quit. He didn't laugh. He just looked at my screen, then at me, and said, \"You're not bad at coding. You're new at it.\"\n\nI want to tell you it was some big cinematic moment, but it wasn't — it was just one sentence, said kindly, on an ordinary Tuesday. Still, something in my chest loosened. New. Not broken. Not wired wrong. New — which is a temporary condition, not a permanent sentence. I went back to that same error message the next morning, and for the first time, I read it like a clue instead of a verdict. It took me another two hours to fix it. But I fixed it. And that word — yet — has been sitting quietly behind almost everything I've learned since.",
              },
              {
                title: 'Try This: Rewrite the Sentence',
                body: "For the next week, catch yourself the moment you think or say \"I can't do this\" or \"I'm not good at this.\" You don't have to believe anything different yet — just add one word out loud: yet.\n\n\"I can't hold a conversation in Spanish... yet.\" \"I'm not good at public speaking... yet.\" Notice that it doesn't erase the difficulty. It just quietly changes the shape of it, from a wall into a distance. Walls don't move no matter how long you stare at them. Distance closes, one honest step at a time — which is exactly what the rest of this course is going to show you how to do.",
              },
            ],
            callout: {
              title: 'The One-Word Rule',
              body: "Any time you hear yourself say \"I can't do this,\" try adding one word to the end: yet. Notice what changes in how the sentence feels.",
            },
            drill: {
              prompt: "Finish Ren's mentor's sentence: \"You're not bad at coding — you're just _____ at it.\"",
              placeholder: 'Type one word',
              accepted: ['new', 'beginning', 'starting'],
              hint: "It's the opposite of experienced.",
            },
          },
          {
            slug: 'how-your-brain-learns',
            title: 'How Your Brain Actually Learns',
            duration: '12 min',
            xp: 25,
            eyebrow: 'Module 01 / Mindset',
            lead: "Your brain isn't a filing cabinet that stores facts in neat folders. It's closer to a trail through a forest — the more you walk it, the clearer and faster it gets.",
            sections: [
              {
                title: 'The Myth of the Empty Folder',
                body: "It's tempting to imagine your brain like a filing cabinet: information comes in, gets stamped, and gets slotted into a folder labeled \"Spanish vocabulary\" or \"guitar chords,\" ready to be pulled out later. It's a comforting picture, but it's almost entirely wrong.\n\nYour brain is made of roughly 86 billion neurons, and none of them store a memory sitting still in a drawer. Instead, memories and skills live in the connections between neurons — tiny junctions called synapses. When you practice something, a specific chain of neurons fires together. Do it again, and that same chain fires again. Fire the same chain enough times, and something remarkable happens: the connection physically strengthens. Scientists sum this up in one famous phrase — cells that fire together, wire together.\n\nThis is neuroplasticity: your brain's ability to quite literally reshape its own wiring based on what you repeatedly do. It's not a filing cabinet. It's more like a trail through tall grass. The first time you walk it, it's slow and you have to push branches out of the way. Walk that same trail every day, and eventually the grass wears down into a clear, obvious path your feet can follow without you even looking down.",
              },
              {
                title: 'Chunking: Turning Static Into Songs',
                body: "Here's the second piece of the puzzle, and it's the reason experts can do things that look almost impossible to beginners. It's called chunking.\n\nShow a beginner a chessboard mid-game and ask them to memorize the position of all 32 pieces, and they'll manage maybe six or seven before their memory overflows. Show the exact same board to a chess grandmaster, and they can often recall the entire position almost perfectly after a five-second glance. This isn't because grandmasters have superhuman memories — tested on randomly scattered pieces that don't form a real game, they do about as well as anyone else.\n\nWhat's actually happening is that a grandmaster doesn't see 32 separate items. After thousands of hours of practice, their brain has learned to recognize familiar patterns — an opening formation, a common attack, a weakness on the back rank — and groups dozens of individual pieces into a small handful of meaningful \"chunks.\" Instead of remembering 32 things, they're remembering four or five.\n\nYou do this constantly without noticing. You don't read this sentence one letter at a time — your brain chunks familiar letters into whole words, and words into phrases. You don't consciously think \"mirror, indicator, clutch, gear\" every time you drive — an experienced driver chunks the entire sequence into one smooth, automatic action called \"changing lanes.\" Complexity doesn't get easier because your brain gets bigger. It gets easier because your brain learns to compress it.",
              },
              {
                title: "Ren's Memory: When Spanish Stopped Being Homework",
                body: "When I started learning Spanish, every single word felt separate and heavy, like carrying groceries one item at a time in your bare hands. \"Quiero\" was one word to memorize. \"Ir\" was another. \"Al\" was another. Building even a short sentence felt like assembling furniture with the instructions written in a language I didn't speak either.\n\nFor the first few weeks, that never let up. I'd stare at a blank notebook page trying to construct \"I want to go to the store\" like I was solving a math proof, translating word by careful word.\n\nThen, somewhere around week five, without any dramatic turning point I can point to, something shifted. \"Quiero ir al\" stopped being three separate words I was assembling and became one shape my mouth already knew how to make. I'd hear a sentence and understand the whole thing before I'd finished consciously translating any single word in it. My brain, it turned out, had been quietly building a trail underneath all that clumsy, effortful practice — and one day I looked down and the trail was just... there. Clear grass worn down by repetition I hadn't even noticed I was doing.",
              },
              {
                title: 'Try This: Build One Trail a Day',
                body: "You don't need to learn fifty new things this week to make real progress. You need to walk the same one or two trails, repeatedly, in short honest sessions, and let your brain do the quiet work of wearing down the grass.\n\nPick one small chunk — a single chord transition, ten new words, one type of math problem — and revisit it for just ten focused minutes today. Then again tomorrow. It will feel like nothing is happening, because neural rewiring doesn't announce itself with fireworks. It happens underneath, silently, one repeated pass at a time — right up until the day you realize the trail is already there.",
              },
            ],
            callout: {
              title: 'Progress Hides Underground',
              body: "Repetition rarely feels like progress while it's happening. It looks like nothing is changing. But underneath, your brain is quietly paving a road you'll be able to run on later.",
            },
            drill: {
              prompt: "Chess grandmasters don't memorize 32 separate pieces — their brains group them into meaningful ______.",
              placeholder: 'One word',
              accepted: ['patterns', 'chunks', 'formations'],
              hint: "It's the same reason you can read this whole sentence instead of letter by letter.",
            },
          },
          {
            slug: 'focused-vs-diffuse-mode',
            title: 'Focused Mode vs. Diffuse Mode',
            duration: '10 min',
            xp: 25,
            eyebrow: 'Module 01 / Mindset',
            lead: "Sometimes the fastest way to solve a problem is to stop looking directly at it.",
            sections: [
              {
                title: 'Two Gears, One Brain',
                body: "Your brain runs on two very different gears when it's learning, and most people only ever deliberately use one of them.\n\nThe first is focused mode: narrow, bright, direct concentration, like a car's headlights cutting through a dark road. It's what you're in when you're actively solving a known type of problem, working through a practice set, or grinding through a passage you're trying to memorize. Focused mode is essential — nothing gets learned without it.\n\nBut there's a second gear: diffuse mode. This is the relaxed, wide-angle, background-processing state your brain drifts into when you're not concentrating on anything in particular — walking, showering, doing dishes, staring out a train window. It feels unproductive, even lazy. It is anything but. In diffuse mode, your brain is free to wander between distant, unrelated ideas and quietly test connections that focused mode is too narrow and rule-bound to notice. Real breakthroughs — the “aha” moment after you've been stuck for hours — happen disproportionately often in this second gear, precisely because it isn't fenced in by the same track you were stuck on.",
              },
              {
                title: "The Shower Thought Isn't Magic",
                body: "You've probably experienced this yourself: a programmer stares at a bug for three straight hours, changes nothing, gets nowhere, and finally gives up and goes to take a shower. Two minutes later, with zero effort and no notebook in sight, the answer arrives, fully formed, apparently out of nowhere.\n\nIt isn't out of nowhere. While the shower is running, the brain's so-called default mode network — the background system responsible for diffuse thinking — is loosely scanning through memories, half-formed ideas, and unrelated experiences, unconstrained by the narrow, exhausted track the focused mind had worn a groove into. It isn't magic. It's just a different, quieter kind of work, happening in a gear you weren't using.\n\nThis is precisely why the most stubborn problems rarely get solved by simply trying harder in the same mental gear that already failed for three hours. They get solved by switching gears entirely — and trusting that stepping away is not the opposite of working on the problem. It's a different, equally necessary phase of working on it.",
              },
              {
                title: "Ren's Memory: The Walk to the Mailbox",
                body: "I used to treat stepping away from a problem as a kind of quitting. I'd sit at my desk, jaw tight, forcing myself to stare at the same stuck paragraph or the same broken function until it \"broke\" — as if sheer stubbornness were the only respectable way to solve anything. Most nights, it just meant staring at the same six lines for two extra hours, getting more frustrated, not more clever.\n\nA friend eventually talked me into trying something that felt almost like cheating: the second I hit a wall, get up and take a short walk. No podcast, no phone, nothing to fill the quiet. Just the front door, the sidewalk, and the mailbox at the end of the street and back.\n\nThe first time I tried it, I remember feeling faintly guilty, like I was avoiding the work. And then, somewhere around the neighbor's fence, the answer to the exact problem I'd been stuck on for two hours just... arrived. Fully formed, no effort required, like it had been waiting patiently the whole time for me to stop shouting over it. It's happened enough times since that it's stopped surprising me. Half the time now, the answer shows up somewhere between the front door and the mailbox — never at the desk, where I was trying the hardest.",
              },
              {
                title: 'Try This: Schedule the Wander',
                body: "After a focused block of studying or practicing — twenty-five or thirty minutes is plenty — deliberately step away from the problem instead of powering through frustration. Walk, shower, do the dishes, stare out a window. No phone, if you can manage it; scrolling keeps you in a different kind of focused mode and blocks the wandering you're trying to make room for.\n\nTreat this as part of the work, not a break from it. You're not being lazy. You're switching to the gear built for exactly the kind of thinking that focused effort can't do on its own.",
              },
            ],
            callout: {
              title: 'Getting Stuck Is a Signal',
              body: "Getting stuck isn't failure — it's the signal to switch gears, not to push harder in the same one that already failed.",
            },
            drill: {
              prompt: 'Good ideas often "randomly" arrive during a walk or a shower because your mind has entered ______ mode.',
              placeholder: 'One word',
              accepted: ['diffuse'],
              hint: 'It\'s the opposite of "focused."',
            },
          },
          {
            slug: 'deliberate-practice',
            title: 'Deliberate Practice — Practice That Actually Works',
            duration: '12 min',
            xp: 30,
            type: 'standard',
            eyebrow: 'Module 01 / Mindset',
            lead: "Doing something for ten years isn't the same as getting ten years better at it. It matters enormously how you spend the hours, not just how many of them you log.",
            sections: [
              {
                title: "Practice Isn't One Thing",
                body: "There are two activities that both go by the name \"practice,\" and confusing them is probably the single biggest reason people plateau. The first is what most practice actually looks like: comfortable repetition. Playing the song you already know how to play. Reading through material you've already read. Shooting free throws the same easy way, over and over. It feels productive — you're active, you're sweating, you're doing something — but you've already mastered the exact thing you're rehearsing, so there's nothing left for your brain to adjust.\n\nThe second is deliberate practice, and it feels almost nothing like the first. It means working just beyond your current skill level, on a specific, narrow target, with fast feedback telling you exactly what to fix. It's slower. It's more frustrating. It rarely feels like flow. And it is, by a wide margin, the version that actually produces improvement — because your brain only rewires the connections it's actively straining against, not the ones it's coasting through on autopilot.",
              },
              {
                title: '500 Shots vs. 50 Corrected Ones',
                body: "Picture two basketball players practicing free throws for the same hour. Player A shoots 500 shots, alone, on autopilot — same rhythm, same slightly-off elbow angle, same result, over and over. Player B shoots only 50 shots, but has a coach standing beside them, correcting one specific thing after every single attempt: elbow in, follow through, wrist snap.\n\nAfter a month of this, Player B — with a tenth of the total shots — improves measurably faster than Player A. The raw volume of repetition mattered far less than the tightness of the feedback loop. Player A spent an hour reinforcing a flawed motion 500 times, making the mistake more automatic, not less. Player B spent an hour with fifty precise corrections, each one nudging the motion slightly closer to correct. Practice doesn't make perfect. Corrected practice makes perfect. Uncorrected practice just makes permanent.",
              },
              {
                title: "Ren's Memory: The One Bar",
                body: "For a long time, I \"practiced\" piano by sitting down and playing the one song I already knew how to play, start to finish, over and over. It felt like practice. I was at the piano, my fingers were moving, forty-five minutes would go by. But looking back honestly, I wasn't practicing the song — I was performing it, badly, on repeat, and reinforcing the exact same mistakes in the exact same three places every single time.\n\nThe shift happened almost by accident. My teacher stopped me mid-song one day and said, \"You always fumble bar fourteen. Just play bar fourteen. Fifty times if you have to. Nothing else.\" It felt tedious and small, playing four seconds of music over and over instead of the whole piece. But something clicked in that one specific bar that a month of full run-throughs hadn't managed to fix. By the end of that single week, targeting only the exact spot I kept messing up, I'd improved more than I had in the entire previous month of comfortable, full-song repetition.",
              },
              {
                title: 'Try This: Find Your One Bar',
                body: "Stop practicing the parts you've already got. Identify the one specific spot where you consistently struggle — the exact chord change, the one grammar rule, the particular type of problem that always trips you up — and drill only that, in isolation, for ten focused minutes.\n\nThen get feedback on it. Record yourself and listen back. Ask someone who's better than you to watch one attempt. Compare your answer directly against a correct one. The combination of narrow targeting plus honest feedback is the entire mechanism behind deliberate practice — and it's available to you in any skill, starting today, without needing a personal coach standing next to you.",
              },
            ],
            callout: {
              title: 'Comfortable vs. Productive',
              body: 'Comfortable practice feels productive. Uncomfortable, targeted practice actually is. Learn to tell the two apart — your progress depends on it.',
            },
            drill: {
              prompt: 'The basketball player who improved fastest took fewer shots but got far more ______ after each one.',
              placeholder: 'One word',
              accepted: ['feedback', 'correction', 'corrections'],
              hint: 'Someone told them what to fix, every single time.',
            },
          },
        ],
      },
      {
        title: 'The System',
        lessons: [
          {
            slug: 'spaced-repetition',
            title: 'Spaced Repetition — Beating the Forgetting Curve',
            duration: '11 min',
            xp: 30,
            eyebrow: 'Module 02 / System',
            lead: "Forgetting isn't a failure of memory. It's a schedule — a predictable curve. And once you can see the schedule, you can beat it.",
            sections: [
              {
                title: 'The Curve That Works Against You',
                body: "In the 1880s, a psychologist named Hermann Ebbinghaus ran a strange, patient experiment on himself: he memorized meaningless syllables and then tested his own memory of them at intervals, for years. What he found became one of the most quietly important discoveries in learning science — the forgetting curve.\n\nWithout any review, memory doesn't decay slowly and gently. It falls off a cliff. You can lose more than half of what you \"learned\" today within twenty-four hours, and the majority of the rest within a week — not because you didn't understand it, but simply because your brain, quite reasonably, treats information it never encounters again as unimportant and prunes it away to make room.\n\nThis isn't a personal failing. It's the default setting for every human brain. Cramming feels like it's beating the curve because you can recall everything an hour after you studied it. But the curve doesn't care about an hour from now — it cares about next week, and next week is exactly when cramming quietly falls apart.",
              },
              {
                title: 'Reviewing Right Before You Forget',
                body: "Here's the fix, and it's almost embarrassingly simple: instead of reviewing something once and hoping it sticks, review it again right around the moment you're about to forget it — and then again, at a longer interval, and again longer still. Each well-timed review doesn't just refresh the memory. It resets the forgetting curve and flattens it, so the next time you'd normally start forgetting, you forget more slowly. Do this enough times, spaced correctly, and the information moves from fragile short-term storage into durable long-term memory.\n\nThis is exactly why medical students — who need to reliably recall thousands of drug names, symptoms, and interactions years later, not just for next week's exam — lean so heavily on spaced-repetition apps like Anki. These apps track exactly when you're likely to forget each individual flashcard and resurface it right at that edge, not too early, when it would be a waste of a review, and not too late, when the memory would already be gone.",
              },
              {
                title: "Ren's Memory: The Exam I Actually Remembered",
                body: "Before I understood any of this, my entire study strategy was one long all-nighter, twelve hours before an exam, powered by coffee and a rising sense of panic. And it worked, sort of — I'd walk out of the exam room feeling like I knew the material cold. Ask me the same questions a month later, though, and I'd have nothing. Not fuzzy memories. Nothing. It was like the information had been borrowed for exactly as long as I needed it and then quietly repossessed.\n\nThe first time I tried spacing things out instead — reviewing new material after one day, then again after three, then again after a week — it felt slower and far less satisfying in the moment. There was no dramatic all-nighter, no adrenaline, nothing that felt like \"real studying.\" But when the exam came, I wasn't just passing it. And months later, in a completely different class, I caught myself still remembering details from that spaced-out material without even trying to recall them. That was the moment I realized cramming had never actually been teaching me anything. It had just been renting me the appearance of knowledge for a single afternoon.",
              },
              {
                title: 'Try This: The 1-3-7 Rule',
                body: "You don't need an app to start. Whenever you learn something you actually want to keep, review it once after one day, once again after three days, and once more after seven days. After that, monthly touch-ups are usually enough to keep it alive long-term.\n\nA simple calendar reminder does the job. The point isn't to re-study everything from scratch each time — it's a quick, honest retrieval attempt: can you still recall this, right now, without looking? If yes, you've just strengthened it. If not, you've caught it exactly in time, right before it would have quietly disappeared for good.",
              },
            ],
            callout: {
              title: 'Efficient vs. Effective',
              body: "Cramming feels efficient because it fits into one sitting. Spacing feels inefficient because it's spread out. Only one of them survives contact with next month.",
            },
            drill: {
              prompt: 'Reviewing material at increasing intervals — one day, three days, a week — is called spaced ______.',
              placeholder: 'One word',
              accepted: ['repetition'],
              hint: "It's right there in the lesson title.",
            },
          },
          {
            slug: 'active-recall-feynman',
            title: 'Active Recall & The Feynman Technique',
            duration: '12 min',
            xp: 30,
            eyebrow: 'Module 02 / System',
            lead: "Recognizing an answer and actually knowing it are two completely different skills — and only one of them shows up when it counts.",
            sections: [
              {
                title: 'The Trap of Feeling Familiar',
                body: "Re-reading your notes feels productive. Highlighting a textbook in three different colors feels productive. Both create a warm, comfortable sense of familiarity with the material — you recognize the words, the concepts feel friendly, nothing seems confusing on the page.\n\nBut recognizing something and being able to retrieve it from memory, unprompted, are almost entirely separate skills, and re-reading only ever trains the first one. This is called the fluency illusion: because the text feels easy and familiar to look at, your brain quietly concludes you must know it well — right up until you close the book and try to actually explain it, and discover the knowledge simply isn't there on its own.\n\nActive recall is the opposite approach, and it's uncomfortable on purpose: instead of looking at the answer, you try to pull it out of memory first, with nothing in front of you — through self-quizzing, flashcards, or just a blank page and a pen. It feels harder in the moment, and it is. That difficulty isn't a sign you're doing something wrong. It's the exact friction that strengthens the memory. Retrieving a memory doesn't just check whether it's there — the act of retrieval itself makes it stronger and easier to retrieve again next time.",
              },
              {
                title: 'Notes From Memory Beat Notes From the Page',
                body: "Take two students studying the same chapter for the same amount of time. One rereads the chapter twice, underlining key phrases as they go. The other reads it once, closes the book, and tries to rewrite everything they can remember from memory — messier, less complete, full of visible gaps.\n\nOn the test, the second student consistently outperforms the first, often by a wide margin. The gaps in their memory-written notes weren't a sign of weaker studying. They were the single most useful part of the entire process — because each gap told them, in advance, exactly what to go back and restudy, while the first student had no idea which parts they actually knew versus which parts just looked familiar on a page they'd been staring at.",
              },
              {
                title: "Ren's Memory: Explaining Photosynthesis to a Six-Year-Old",
                body: "I thought I understood photosynthesis. I could recognize every term in the textbook paragraph — chlorophyll, glucose, carbon dioxide — nod along, feel the comfortable click of familiarity. Then my little cousin asked me, completely sincerely, how plants \"eat,\" and I opened my mouth to give a simple answer and… nothing came out that made any sense.\n\nI kept reaching for the textbook words, and every time, she'd ask a perfectly reasonable follow-up — \"but where does the food come from?\" — and I'd realize I was just repeating vocabulary, not actually explaining anything. I had to stop, go back to the material, and this time read it looking specifically for the gaps I'd just discovered live, in real time, in front of a six-year-old. It was a little humbling. It was also the single most useful study session of that entire unit, because I finally understood the difference between recognizing words on a page and actually being able to explain the idea behind them. That's the whole engine behind what's called the Feynman Technique, named after the physicist Richard Feynman: if you can't explain something simply, in plain words, to someone with no background in it, you don't fully understand it yet — you've only met it.",
              },
              {
                title: 'Try This: The Empty Page Test',
                body: "After you study something, close every book, tab, and note. Take a blank page and write down everything you can remember about it, in your own words, without peeking. Only afterward, compare what you wrote against the real material.\n\nThe parts you got right are genuinely learned. The gaps — and there will always be gaps — are your exact study list for the next session, no guessing required. For an even sharper test, try explaining the topic out loud, in simple language, as if you were teaching it to an eight-year-old. The moment you get stuck is the moment you've found precisely what you don't understand yet.",
              },
            ],
            callout: {
              title: 'Met It vs. Understood It',
              body: "If you can't explain something simply, you don't understand it yet. You've just met it.",
            },
            drill: {
              prompt: 'Explaining a concept in plain, simple words — as if teaching a child — is called the ______ Technique.',
              placeholder: 'A name',
              accepted: ['feynman'],
              hint: 'Named after a famous physicist.',
            },
          },
          {
            slug: 'designing-your-environment',
            title: 'Designing Your Learning Environment & Habits',
            duration: '11 min',
            xp: 30,
            eyebrow: 'Module 02 / System',
            lead: "You don't need more willpower. You need a room, a routine, and a pillow that quietly make the right choice the easy one.",
            sections: [
              {
                title: "Willpower Runs Out. Environment Doesn't.",
                body: "Most people treat consistency as a personality trait — some people just \"have discipline,\" and others don't. But willpower behaves more like a battery than a personality: it's a limited resource that drains over the course of a day, gets weaker when you're tired or stressed, and simply isn't reliable enough to build a habit on top of every single night.\n\nEnvironment doesn't get tired. A book sitting open on your desk doesn't need motivation to stay open. A distracting app that's been deleted doesn't need willpower to resist, because the choice has already been made in advance, back when your motivation was high, for the exact moment later when it won't be. The most consistent learners aren't relying on stronger willpower than everyone else. They've simply engineered a smaller number of decisions they need willpower for in the first place.",
              },
              {
                title: 'Habit Stacking and Friction',
                body: "Two simple design tools do most of the heavy lifting here. The first is habit stacking: attaching a brand-new habit onto one you already do automatically, every single day, without fail. You don't build a habit around motivation — you build it around a moment that's already locked into your routine.\n\nThe second is friction. Every habit, good or bad, has a certain number of steps between you and doing it. Reduce the steps for the habit you want, and it becomes almost automatic. Increase the steps for the habit you're trying to avoid, and it quietly loses its pull.\n\nA writer who used to \"wait for motivation\" and often waited for days finally fixed it not through more discipline, but through habit stacking plus reduced friction: they left their laptop open on the kitchen table the night before, right next to the coffee machine. Every morning, the coffee habit — already automatic — now leads directly into 300 words of writing before the laptop even gets closed. No motivation required. The routine does the deciding.",
              },
              {
                title: "Ren's Memory: The Textbook on the Pillow",
                body: "I never had the discipline to study every single night — I tried, promised myself I would, and quietly broke that promise more nights than not. What actually worked had nothing to do with discipline at all. Every morning, before I left for the day, I'd put my textbook directly on top of my pillow.\n\nIt sounds almost too small to matter. But it meant that at the end of the day, I physically could not get into bed without first moving the book — and moving the book meant it was already in my hands, already open, and opening it thirty seconds later took almost no additional willpower at all. I wasn't relying on some late-night burst of motivation to start studying. I'd already made the decision that morning, back when it was easy, and the pillow was just carrying that decision forward for me. Small trick. Genuinely huge difference, night after night, for months.",
              },
              {
                title: 'Try This: Find Your Anchor Habit',
                body: "Pick one thing you already do, every single day, without needing any motivation at all — brushing your teeth, making coffee, sitting down at your desk. Attach your new learning habit directly onto it: right after the coffee, right before you brush your teeth, the moment you sit down.\n\nThen find one piece of friction you can remove today. Leave the book open and visible instead of closed on a shelf. Log out of the distracting app during your study window instead of trusting yourself not to open it. You're not trying to become a more disciplined person overnight. You're redesigning the room so the right choice barely requires a decision at all.",
              },
            ],
            callout: {
              title: 'The Spark and the Kindling',
              body: "Motivation is a spark. Environment is the kindling. Don't rely on the spark to keep the whole fire burning by itself.",
            },
            drill: {
              prompt: 'Attaching a brand-new habit onto one you already do automatically is called habit ______.',
              placeholder: 'One word',
              accepted: ['stacking'],
              hint: 'Like putting one building block on top of another.',
            },
          },
          {
            slug: 'transfer-making-it-useful',
            title: 'Transfer — Making Knowledge Actually Useful',
            duration: '13 min',
            xp: 35,
            type: 'capstone',
            eyebrow: 'Module 02 / Capstone',
            lead: "Every skill you've ever learned was secretly teaching you a second, hidden skill underneath it: how to learn.",
            sections: [
              {
                title: 'The Skill Behind the Skills',
                body: "There's a final layer to all of this, and it's the one that ties every earlier lesson together: metacognition, which is simply thinking about your own thinking. It means stepping back, after you've studied or practiced, and asking not just \"what did I learn?\" but \"how did I learn it, what actually worked, and what does that tell me about the next completely different thing I try to learn?\"\n\nMost people only ever focus on the content — the vocabulary, the chords, the formulas. Metacognition looks one level higher, at the process underneath the content, and that process turns out to be far more reusable than any single fact ever is. Knowing the date of a historical battle transfers to almost nothing else. Knowing that you personally learn best through spaced review and hands-on mistakes, rather than passive reading, transfers to literally everything you'll ever try to learn for the rest of your life.",
              },
              {
                title: 'The Chess Player Who Never Played Business',
                body: "Consider a competitive chess player who spent years training a very specific mental habit: before making any move, pause and think several steps ahead — if I do this, then what happens, and then what happens after that, and is the position still good for me three moves from now?\n\nYears later, in a completely unrelated career in business strategy, that same player finds themselves instinctively running the exact same mental process before a major decision: if we launch this now, competitors respond how, and where does that leave us two quarters from now? Nobody taught them \"if-this-then-that\" strategic thinking in a business course. They'd already built that exact mental muscle, years earlier, over a chessboard that had nothing to do with business at all. The specific subject changed completely. The underlying pattern of thinking transferred perfectly, because they'd learned the shape of the skill, not just its original costume.",
              },
              {
                title: "Ren's Memory: Guitar, Spanish, Code — One Story",
                body: "Looking back now, I don't think of guitar, Spanish, and coding as three separate things I happened to learn. Guitar taught me patience — that a chord which sounds terrible for three straight weeks can, without any single dramatic breakthrough, simply start sounding right if you keep gently adjusting instead of giving up. Spanish taught me not to fear mistakes — that mispronouncing a word in front of a native speaker feels embarrassing for about four seconds and then is completely, instantly forgotten by everyone except me. Learning to code taught me how to break one overwhelming problem into a dozen small, boring, manageable ones, instead of staring at the whole intimidating mountain of it at once.\n\nNone of those three skills were ever really separate from each other, even though they felt like it while I was inside each one. They were all quietly teaching me the exact same underlying thing, wearing three different disguises: how to learn. And once I noticed that, every new skill I've picked up since — fitness, public speaking, whatever comes next — has started from a running head start, because I already know roughly how I learn, even before I know the first thing about the subject itself.",
              },
              {
                title: 'Try This: Your Learning Autobiography',
                body: "Write down three skills you've picked up in your life so far — anything, big or small. For each one, ask a single question: what did learning this actually teach me about how I learn, separate from the subject itself? Did you need to see it, or hear it, or do it with your hands before it clicked? Did you need someone correcting you in the moment, or quiet, private practice? Did small daily repetition beat occasional long sessions, or the other way around?\n\nLook for the pattern that repeats across all three. That pattern — not any single fact from any single skill — is the actual tool this entire course has been trying to hand you. Point it at whatever you decide to learn next.",
              },
            ],
            callout: {
              title: "The Real Souvenir",
              body: "You're never just learning a skill. Every single time, you're also quietly collecting another page of your own personal instruction manual.",
            },
            table: {
              title: 'Your Learning Toolkit',
              headers: ['Lesson', 'The Tool', 'When to Use It'],
              rows: [
                ['Mindset', "Add the word \"yet\"", 'Whenever you feel stuck or want to quit'],
                ['Brain Science', 'Repeat in short, honest trails', "When something feels overwhelming or too separate to hold"],
                ['Focus', 'Step away on purpose', "When you're grinding on the same stuck problem"],
                ['Practice', 'Target your one weak point', 'When practice feels easy but progress feels slow'],
                ['Memory', 'Review on a schedule', 'Right after you first learn something new'],
                ['Recall', 'Test yourself, explain it simply', "When you think you \"get it\""],
                ['Environment', 'Remove the friction', "When you keep meaning to start but somehow don't"],
              ],
            },
            drill: {
              prompt: 'The habit of thinking about your own thinking — how you learn, not just what — is called ______.',
              placeholder: 'One word',
              accepted: ['metacognition'],
              hint: '"Meta" means "about itself."',
            },
          },
        ],
      },
    ],
  },
]

export const getCourse = (slug?: string) => courses.find((course) => course.slug === slug)
