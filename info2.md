Track A: The Concept Check
A tool that tells a 100x learner whether they truly understand a concept, or whether they only recognize the words for it.
Picture this first
Sit down with a cohort-mate who says they understand what an interface is. Ask them one plain question: why does a backend exist at all? Why not run everything in the browser?
They start strong. Then somewhere in the second or third sentence, the explanation stops being theirs. It turns into a line they remember from a lecture. You can hear the exact moment it happens. The words keep coming, but the thinking has stopped.
That moment is the whole project.
You are going to build a small tool that finds that moment for any learner, on any concept, and then checks one thing: when you point at the gap, can they actually go back and close it, or do they just nod and stay stuck?
That is it. The app is small. The hard part is finding out something true about how a real mind holds an idea.
What the tool does, in one line
A learner names a concept and explains it in their own words. The tool returns one thing: the single place where their understanding is a label and not understanding, plus the one follow-up question that exposes it.
Not a score. Not a quiz. A diagnosis of the gap.
The concept you will work with: interface, as a lens
We taught interface as a way of seeing systems. It is one of the most important lenses in systems thinking. So that is the concept your tool will be built around.
When you test a learner, ask them to derive one of these from first principles:
•	What is an interface, really? What is an API underneath the word?
•	What goes on behind the scenes when you open the ChatGPT app?
•	What is a frontend, and what is a backend, and why do we need both?
•	Why do we need a backend at all?
•	What are the different ways to store data, and why do we need a database from first principles?
•	How do you choose one storage option over another, and which factors decide it?
Pick concepts from this list for the people you test. These are things they have all seen in the combined lectures, so nobody can say "I never learned this." If they truly understood it, they can derive it. If they only memorized it, they cannot.
The five moves
You will walk five moves. Each one ends in something you hand in. Do them in order. The order is part of the design.
Move 1: Watch two real people think, and be the tool yourself
Pick two cohort-mates who say they understand one of the interface concepts above. (Two is the minimum bar. Do more if you can, it only makes your evidence stronger.)
Ask each one to derive the concept out loud, not define it. Push them with the why, the what-breaks-without-it, and the when-would-you-reach-for-it. Then, in the same sitting, do by hand the exact job your app will later do: name the one place their explanation became a memorized phrase, and hand them a single follow-up question that exposes it. Watch what happens next. Did naming the gap help them close it, or did they nod and stay stuck?
You are the best possible version of the tool right now. If the value does not show up when a sharp human delivers it, no app will save it. So test the value first, by hand.
Questions to sit with:
•	Where exactly does the explanation stop being true understanding and turn into a memorized phrase? Can you point at the sentence?
•	Is it the same spot for both people? If two people break at the same place, that's a valuable insight.
•	When you handed them the follow-up, what changed? Did they think, or did they reach for another memorized phrase?
You submit: the raw record of both sessions (a transcript, an audio clip, or screenshots of the real exchange, with names), the one sentence in each where the explanation became a label, and a short log of the follow-up you used and whether they could derive it afterward.
Move 2: Write down your hypothesis, before you build anything
Turn what you saw into a claim with a number, and lock it before you write a line of code.
The claim looks like this: a 100x learner who passes a normal "did you understand" check, meaning they can define the term, will still fail to derive it under one sharp follow-up, more often than not.
Fill in three numbers and timestamp them:
•	the result that would prove you right,
•	the result that would mean you imagined a problem nobody has,
•	the kill-number: the result at which you stop defending the idea and write "my hypothesis was wrong."
Make them the first commit in your github repo.
Questions to sit with:
•	If you are honest, what result would actually change your mind?
•	Have you written a kill-number you would really accept, or one you secretly know can never happen?
You submit: the timestamped hypothesis, with the kill-number, dated before your first commit.
Move 3: Decide what the computer judges, and what it must not
This is the move that separates an engineer from someone who pastes prompts. Draw a clear line through your system between what is deterministic (fixed, rule-based) and what is probabilistic (judgment, handled by the model i.e. LLM).
•	Probabilistic, the judgment: finding where the explanation breaks, writing the follow-up, deciding whether the second try closed the gap.
•	Deterministic, the structure: the list of concepts, the record of each session, the link from a named gap to its second-pass result, the access rules, and the plain calculation of whether the gap closed.
Now the hard call, and you must make it on purpose. Who judges the second derivation? If you let the model decide whether the learner "now understands," you have put a soft judge at the exact point where your whole claim is won or lost, and a soft judge tells everyone they passed. If you make it a human check or a strict rule, it is harder to fake but slower. There is no free answer. Pick the boundary, name the failure mode of your choice, and own it.
Draw this by hand. On paper, draw a box for the deterministic parts and a box for the probabilistic parts, mark the line between them, and circle where the judge of the second derivation sits. Take a photo or screenshot and paste it in. Hand-drawing this forces you to actually decide, which is the point.
Questions to sit with:
•	If you made everything a model call, where would your claim quietly break?
•	The model, left alone, turns everything into a model call. Where is the one place you refuse to?
You submit: the hand-drawn boundary diagram (photo or screenshot), plus a few lines naming what is deterministic, what is probabilistic, where the judge sits, and the failure mode you accepted.
Move 4: Draw the domain model, the shape of the data
First, the domain model. What does a learner create each time they use this, and what does it belong to? Is a concept a row in a table, or a fixed list you ship with? Where does the record of "they went back and closed the gap" live, and what does it point at? The link from a named gap to its second-pass result is not bookkeeping. It is your evidence and your metric at the same time.
Draw the schema by hand. Sketch the tables and the links between them on paper, and clearly mark the foreign key that connects a named gap to its second-pass result. Photo or screenshot, paste it in. Draw it before you touch any SQL.
Then, lock it. Add identity, then row-level security, so one learner can never see another learner's sessions or gaps. Run the two-user test in your own deployment: log in as two different people and confirm neither can read the other's rows.
Questions to sit with:
•	If the gap-to-result link did not exist, could you still prove the tool worked? (If not, it is your most important field.)
•	What is the simplest test that would catch one learner reading another's data?
You submit: the hand-drawn schema (photo or screenshot) with the gap-to-result link marked, and proof the two-user test passes (two accounts, the attempted cross-read, the empty result).
Move 5: Put it in front of two people, and report what really happened
Now the real test. Two people run the actual tool. At least one of them must be someone you did not coach through it, a cold user.
"They said it was helpful" does not count and never will, because helpful is what people say to be kind. The only signal is behavioral: each person failed to derive a concept before, and derived it after, and you hold the evidence of both states.
Then write the one section that proves you made contact with reality: the surprise. Your hypothesis in Move 2 had a number. What did these two cases actually show, and where were you wrong? Maybe the gap was not where you predicted. Maybe they derived fine and failed at applying it instead. Maybe your follow-up exposed nothing and you had to find a new one mid-session. Name one concrete place where reality contradicted you, with the evidence.
Questions to sit with:
•	What does a real "they closed the gap" look like? Decide this before you open it, so you cannot grade yourself generously later.
•	Where did reality refuse to match your bet? Be specific.
You submit: for each of the two people, the before-state and after-state evidence of derivation, and one documented surprise where reality broke your prediction.
What you hand in
The app is plumbing. It must run, and the walls must hold, but there are no points for polish. Everything that earns the grade is the evidence that a human did what the model cannot.
1.	Two raw derivation records, with the by-hand follow-up log and the sentence where the model became a label. (Move 1)
2.	Your timestamped bet, with the kill-number, dated before your first commit. (Move 2)
3.	The hand-drawn boundary diagram, plus where you put the judge and the failure mode you accepted. (Move 3)
4.	The hand-drawn schema with the gap-to-result link marked, and the two-user test result. (Move 4)
5.	For two people, before-and-after derivation evidence, and one documented surprise. (Move 5)

No item 5, no submission. A working app with item 5 missing is a well-built thing that proves nothing, which is the one outcome this whole project exists to prevent.
Submission template
Hand in a single document with these exact sections, in this order. The headings are given. The content is yours.
CONCEPT CHECK SUBMISSION
Name:
Concept(s) tested:
Public Github Repo link:
MOVE 1: WATCH TWO PEOPLE
Person 1, raw record (link or screenshots):
Person 1, the sentence where the model became a label:
Person 1, follow-up used / could they derive after?:
Person 2, raw record (link or screenshots):
Person 2, the sentence where the model became a label:
Person 2, follow-up used / could they derive after?:
MOVE 2: THE HYPOTHESIS (timestamped, before first commit)
The claim:
Result that proves me right:
Result that means no problem exists:
Kill-number:
Timestamp / commit link:
MOVE 3: THE SYSTEM DESIGN
[paste hand-drawn system design diagram here]
Deterministic parts:
Probabilistic parts:
Who judges the second derivation, and why:
Failure mode I accepted:
MOVE 4: DOMAIN MODELLING
[paste hand-drawn domain model here]
Two-user test: two accounts, attempted cross-read, result:
MOVE 5: THE FINAL REPORT
Person A (cold user / coached?):
Before-state evidence (could not derive):
After-state evidence (derived):
Person B (cold user / coached?):
Before-state evidence (could not derive):
After-state evidence (derived):
The surprise (one concrete place reality broke my prediction, with evidence):

Two of these are hand-drawn on purpose: the system design diagram (Move 3) and the domain model (Move 4). Draw them on paper, photograph or screenshot, and paste them in. A drawing you actually made is something you cannot fake by pasting a prompt.
Part 2: Why it is built this way
This part is the reasoning. Read it to understand the design choices above. It is not new instructions. It is the meta-level thinking behind the job.
Why recognition is now worthless as a signal
The model will define any term for you, instantly, for free, forever. Recognition just became infinitely cheap. And anything infinitely cheap is worthless as a signal. Knowing the word "API" tells us nothing about you now, because the model knows the word too.
The one thing that is still yours is whether you can derive a concept when nobody hands you the words. Recognition is free. Derivation under pressure is not. This is the dual paradox made concrete: the model made one human skill worthless and left exactly one standing. You are building the instrument that tells the two apart.
Why you start by watching real people, not by coding
The first move is a recording of two real people you actually sat with. That is the one thing the model cannot produce for you. If you skip it and start from the app, you are building on a problem you assumed instead of one you saw. Everything downstream inherits that mistake.
Why you write hypothesis before you build
A number written after you see the data is a number chosen to make you look right. The model can hand you a plausible fraction in a second. It cannot pre-commit your honest reading of two people you just watched. The kill-number is there so you cannot quietly move the goalposts when the data disappoints you.
Why the system boundary in Move 3 is the whole skill
The model, left alone, turns everything into a model call. The entire engineering skill is knowing where not to. If you let the model judge whether someone "now understands," you have placed a generous judge at the exact point where your claim lives or dies, and it will pass everyone. Choosing that boundary on purpose, and owning its failure mode, is the purest test of the Verifier's Rule on this whole series.
Why two case studies, not a percentage
With two people you are not measuring a rate. A "67% close rate" over three people is noise and you know it. You are producing two cases deep enough that a skeptic reads them and believes the tool did something real. Two documented closes beat a percentage every time at this sample size.
Why a clean disproof is a top grade
If you write your hypothesis honestly, run it on two people, and they derived cleanly both before and after, then your hypothesis was wrong. That is not a failed project. That is a clean finding. Reported with the evidence and the timestamped hypothesis that proves you did not move the goalposts, it scores above a polished app with two warm compliments and no honest signal. The model can build something that looks like it worked. It cannot hand you a disproof from data it never collected. The disproof is yours, and it is worth more.
The trap to avoid
A multiple-choice quiz tests whether someone can recognize the right answer among four. It cannot tell understanding from a lucky guess, it teaches nothing, and the model can generate a thousand while you sleep. If you find yourself building a quiz, you have lost the plot. You are building the opposite of a quiz: a thing that makes recognition fail loudly.
When it is real
A cohort-mate you did not recruit runs a concept they thought they knew, gets told the uncomfortable truth, goes and fixes it, and comes back next week to check another one. Or you run it on two people, both derive cleanly, and you report honestly that the gap you identified as your hypothesis was not there. Either way you have done the real thing, which was never the app. It was finding out something true about how a real mind holds a concept.
What this one teaches that the others do not
How to build an AI whose output is a judgment about a human's mind, and how to grade that judgment when the user is the least reliable witness to their own gap. Build the thing that detects real understanding, and you will understand the difference better than anyone who only ever got tested.

Build the service. Earn the software. Trust the verifier.
