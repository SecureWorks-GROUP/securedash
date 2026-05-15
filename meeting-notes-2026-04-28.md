# Meeting Notes — 2026-04-28

## Summary

### Action Items

- [ ] Shaun to create three MD files: personal agent, coding orchestrator, and operational agent (Jarvis)
- [ ] Shaun to set up workflow using agents through terminal and begin daily logging routine
- [ ] Shaun to implement automations on Supabase/SecureOps (instead of through AI reasoning)
- [ ] Shaun to audit bookkeeping process and identify automation opportunities
- [ ] Shaun to query secure docs wiki on GitHub and extract information
- [ ] Shaun to read CIO documentation and brainstorm agent setup
- [ ] Shaun to review meeting notes and plug into terminal
- [ ] Both team members to share operational agent MD file on GitHub
- [ ] Manan to continue work on data flow and scoping tool QA process
- [ ] Manan to work on sales automation

### Three-Agent System Overview

- Team will implement a three-agent architecture using MD files as the foundation
- Each person has a personal agent with context about their specific work life
- Shared coding orchestrator agent helps with development decisions and planning
- Operational agent (Jarvis) manages company operations and compounds learning over time
- All agents use MD files for instructions, memory, and context
- MD files will be stored on GitHub initially, later migrating to Railway for autonomous operation

### Personal Agent Implementation

- Shaun's personal agent will be called "Neo"
- Agent consists of markdown files containing instructions, current work state, and memory
- Morning routine: agent scans Notion/task manager, recent emails, job management system to gain real-time context
- Agent also reviews weekly plans, monthly goals, and quarterly targets for alignment
- Contains training instructions and can provide guidance from owner's perspective
- End-of-day routine: logs information, writes daily log, stores in Notion
- Friday routine: synthesizes Monday-Friday information and sends report
- Agent can structure time, log issues in correct spots, and track task management automatically

### Coding Orchestrator Agent

- Dedicated agent for coding architecture and development decisions
- Helps decide what to code, how to code it, how to plan and implement
- Acts as manager with authority over certain wiki files
- Ensures code changes don't inadvertently modify unintended areas of repositories
- Updates own context after each session for alignment rather than automation
- May merge with personal agent initially, but maintains separation of concerns
- Orchestrator stays high-level and zoomed out, giving directives and plans
- Spawns separate exploration agents in other terminals for detailed work

### Operational Agent (Jarvis)

- Shared agent between team members for company operations
- Saves learnings about how the company operates over time
- Contains explicit instructions for operational workflows (e.g., never send invoices without approval)
- Instructions compound over time, increasing autonomy
- Eventually will run on Railway for continuous operation
- Will handle routine operational tasks automatically based on learned patterns
- Needs structured, easily queryable information to avoid context overload

### Context Management & Workflow

- Context window must stay under 40% to maintain quality output
- AI degrades sneakily above 40%, appearing to function properly while producing lower quality results
- Solution: orchestrator agent reads summaries and stays high-level
- Detailed work happens in separate exploration terminals
- Workflow: orchestrator receives plans → spawns exploration agents → agents investigate → findings returned to orchestrator → orchestrator synthesizes → creates development plan
- Development happens in separate terminals that close when finished
- All context gets saved to MD files at end of day
- MD files contain both instructions and stored information for continuity

### Wiki & Knowledge Structure

- MD files serve as directory/map rather than containing all information
- Outlines how information is structured in Supabase and other systems
- Contains index of what exists and where to find it
- Agent knows structure without loading full content until needed
- MCP tools list maintained so agent calls correct tools
- Prevents context overload while maintaining accessibility

### Automation Strategy Shift

- Key principle: reduce AI compute by having the system itself do heavy lifting
- Hard-code stage transitions and rules into SecureOps/Supabase rather than using AI reasoning
- Example: when quote is viewed by client, webhook automatically moves job stage
- Maximizes simple automation first, then adds AI for complex reasoning
- Same automations previously done in GoHighLevel now implemented in Supabase
- Automations must be documented in MD files for visibility and coordination

### Bookkeeping Automation Project

- Current bookkeeper charges too much; goal is to automate their work
- Target: either eliminate bookkeeper or reduce to monthly/bi-weekly reviews at lower cost
- Key processes to automate: invoice transfers to Xero, trade invoice formatting, receipts/purchase orders
- Receipts are most complex: requires mix of automations, coding, and new SOPs
- Different receipt sources: Bunnings (auto-uploads via API), supplier invoices, manual fuel receipts
- Batch payments currently done by bookkeeper, can be automated or delegated to Esther

### Sales Process Automation

- Nitin's sales process being automated with terminal-based workflows
- System queries 50 newest inquiries, drafts personalized responses in spreadsheet
- Nathan edits and approves, then system sends customized texts
- Next phase: convert to automatic routines for follow-ups and pipeline hygiene
- Pipeline hygiene: auto-fills missing client information (address, name, email) into Supabase
- Phone call transcriptions fed into Supabase for rich client context
- System identifies when to call clients after quotes sent
- Routines run Monday/Wednesday/Friday automatically
- Calendar auto-booking from transcribed phone calls via webhooks
- Result: Nitin only answers phones, shows up on-site, sends quotes — everything else automated

### Data Flow & Development Priorities

- Manan's top priority: finish data flow between systems
- Adding QA stages to scoping tool for better data transfer to Supabase
- QA process captures exact scope instance in read-only mode
- Iteration unlocking mechanism for scope changes
- Data must flow correctly to ops, trade app, sales side, and Xero
- After data flow: focus on sales data and automation
- Shaun not touching scoping/ops integration for now — Manan handling comprehensive rebuild

### Work Allocation & Priorities

- Shaun's role: 70% operations, 30% code
- Operations fires and issues always take priority over coding work
- UI work acceptable but within the 70-30 split
- Agent system should automate reporting so updates happen automatically
- Task management can pull from both Notion and Todoist via MCP

### Team Culture & Development

- Company goal: create environment of godly men working together, becoming more Christ-like
- Feedback from team members: unique environment compared to other companies
- Shaun's background: expected to do law, now doing construction tech/coding with no prior experience
- Learning AI agents, edge functions, future-proofing systems — all new skills
- Company provides space to grow into roles and develop new capabilities
- Early adopter advantage: few companies operating this way
- Future-proof skills: 40 hours/week of deep AI work positions team well for changing job market
- Potential future direction: SaaS product building harnesses for other companies

---

## Transcript

Yeah, he's just got... An idea and his rambling.

Hey, can you hear me? But yeah, I can hear you. More importantly, no shit can hear you, so I couldn't take notes.

Okay.

You were talking about now we start building Sean's personal agent, Java says operational brain. Yes.

Yep. Yeah. Okay. uh, I'm sure we'll refine it and then you can ask me some questions, but... Is it? The way that people are going to work in the future is everyone will have their own personal agent as well, right? Yep. And then on top of that, Our company is also going to have an agent, which is Jarvis. Yeah. Yeah. So... That's the real zoomed out explanation is you have a personal agent that has context about your specific life to the degree that you want to give it to it.

Obviously, like, you're privacy conscious, which is good. So limit that to your work life. in the information that you want to give it pertaining to that. But what's amazing is when we structure that agent with highly specific context about you, It can give you really critical insight at all times. And What I want you to do is use that agent to help you decide What to do? And how to do it? Uh... Continuously.

So.

When you say it. What do you mean by it?

So What I mean by that is, we create a mockdown file. And maybe there'll be, Three markdown files. And the culmination of all three Markdown files is Sean's personal agent. Huh? The main markdown file is instructions for how the agent is supposed to run. then another markdown file is like what Sean's up to at the moment. And Where is the current state of work? And then another lockdown file is I don't know, maybe you just need to.

you have one markdown file, which is like, memory, instructions, things that you've learned. how to operate, how to talk to you, how to instruct you. how to get maximum value on you, how to keep you on track. And also you might put in there different workflows and routines. that you get it to do for you consistently. For example, For example, picture this, right? You start up your terminal. and you say, good morning,Brian, whatever. Have you called?

But inside the markdown file, you have an instruction that says, when Sean tells me good morning, Because every day from 8 to 4, you start it up and you close it down. Huh? So you tell it when you say good morning, Brian. Scan through Notion. or let's just say scan through your task manager of choice. Read it, get context of where it's at. Scan through the list of the most recent 30 emails. Really get context where it's at. Uh...

have a look at X, Y, Z on the job management system. Get context roads out. Now your agent has real-time understanding of where the system's at. But on top of that, maybe it's scanned. plan for the week. goals for the month. Strategic targets for the quarter. Now it's very aligned on what's important and what's not important. Now on top of that, we'll hard code in there specific things so it trains you as an operational manager.

So I can brain dump and then refine a bunch of instructions from my side of what I value what I want you to do, what I don't want you to do. So it has a parameter for your role and it can even speak to you. From my perspective as an owner, she can ask you questions and bounce off things. to you know, to keep you aligned and focused throughout the day. To give you an idea, I'm going to do the exact same thing for myself.

Yeah, just with another agent my own personal agent But the nice thing is, yeah, at the end of the day, You say okay, my day's done. Now you've got a running context of that date. Everything that you did, what you accomplished, Whatever. Then it needs to initiate a different routine or sequence that you've set up. Maybe it's going to log some information into that second MD file. Maybe it's going to write your daily log for the day and store it inside Notion.

Right?

And...

So that becomes the process of how you engage with things. And it just automates a lot in your life and you can begin to compound different routines and stuff like that. So you don't have to do it anymore. So if you do that Monday to Friday, then on Friday you have a different routine that runs, then it's going to combine all the information Monday to Friday. synthesise a report together and send off an email to me. Hmm.

So I don't have to ask you like how things going. Even think about your task management. If I upload stuff onto, notion as well. then your terminal will be able to see it automatically. Or you'll be able to see it when you're working on it. but it can structure your time and keep you updated all the time. Like if you're, talking to it and you discover an issue or a problem or whatever, it should log it in the correct spot.

And it also knows stuff about the different repos and everything that we have listed. Okay. Mm-hmm. So does that make sense first of all?

No, it makes sense. I get where you're headed. I understand that. The essence of it is instead of me doing it, you get an agent to do the routine stuff. and it has better visibility and Yeah, I get it.

Because the transition, the key unlock here is that you're running off of an MD file that the agent continuously updates. You have to monitor what's in that MD file though, so that the instruction set is really high quality and the memory set is really high quality. And the more that we get it to do that, it will become so aligned at a point that its ability to help you operate will be so high.

Mm. Okay.

And also like... its reporting to me will be so high as well. Mm-hmm. Do you know what I mean? And that can stay on GitHub as well. Yeah.

because those things don't need to change. What's up? No, they can live and give up if they don't really need to change.

They're not very — Yeah, or when it does get changed, you want that barrier there because when you do want to make small changes and tweaks to your own agent, it's protected. Yep. And Yeah. we can like and I can also read that agent about how you've set it up and And we can talk about how we can add things or tweak it or improve it, whatever. That's the one side of it. Now, on top of that agent, we want to have two more agents.

One agent is The operational brain, or JARVIS.

Now this is the file. So, sorry, just, just back up a little bit. There's my so-called personal agent. And then there's your personal agent.

Do you have a name for your agent? What would you call it? Just pick a name out just for the context of this. I don't know.

Candy. I'm looking at candy. Okay. Candy.

Call it Neo, bro. Your age is Neo, okay? From the Matrix. That's not candy!

Go for another one, not candy.

Neon. So you got your personal agent called Neon. Now you have two more agents. One agent. One idea is, This is the one I'm kind of a bit confused about, but I think... We're either going to share this agent or you're going to have your own one and I'm going to have my own one. Um, Probably it's going to be Okay, it's going to be shared. And I'm not, I'm only going to use that agent a little bit. You're going to use it a lot.

This agent is essentially going to be...

No, no, not that one. Just the other one.

This agent is essentially going to be your coding Uh, your coding Architect. Okay. And it's gonna be the advisor that helps you decide what you can code, how to code it, how to plan around that code, how to implement the code. etc. Okay. Okay. Now the reason for that is because You know how we talked about at the beginning, the wiki and all those markdown files and stuff like that. Mm-hmm. We essentially, what we're going to do is essentially Establish an agent that has authority over certain files inside the wiki. Like a manager.

Okay. And Just like in real life, If it doesn't get the manager's approval, No one's allowed to touch that stuff. Mm-hmm. Does that make sense? So... You know how I was talking to you before about What's coded and why and where is the code up to? Thank you. That's kind of the stuff that that agent is in charge of. So when you want to make a change in... What was that change that you wanted to work on today?

the schedule, adding the acceptance for the schedule.

Schedule agents. I'll have to try it out. So... It's a good example because You have to touch a lot of different areas and domains. in order to Um, Like, do that work? And essentially we need to make sure that You don't fiddle with RepoX and change something along the way to make your change. that you weren't meant to change in RepoX.

Understood, yeah.

And I just have to streamline how I think about it with my agent versus your agent, or if we just share the agent. I think for simplicity, we're just going to share it, bro. I don't know. This is too hard. I'll make one for you and make one for me. Because I've just built one yesterday for myself. called the CIO, like the Chief Information Architect. that handles just handles all of the coding stuff because bro it was just it was so difficult and really confusing Basically, what we want is we're going to run it with the same methodology of It has marked down files and stuff like that and it updates its own context every time that you finish session. That's not so much for automation.

It's more for alignment. Okay. So that, because what happened when I was coding and doing deep work is one terminal goes off on this really interesting micro niche. thing right and it starts coding all this stuff And then You either get distracted or you close that terminal down or whatever. And then basically you've got an open loop. where no one remembers any of the context of what was done, where it was up to, or why, except in your own head.

you Yeah. And if that happens enough, then obviously you just end up with absolute cookery, which is we've begun a process of trying to fix that cookery. Uh... Anyway, does that kind of make sense? Like, it's starting to get hard for me to explain it. Does that make sense?

I understand in the sense where like, whatever work that I do, it doesn't get saved. And that's what context is lost. And I get the whole, like, that's why you need that. That's, that's, The explanation notes as to why we changed, what was changed. Basically the heart behind why we're doing that change Um... But I guess. I'm a little bit Confused. with the way we do it. Yeah, in front of the display.

Yeah, fair enough, man. The second coding agent is a bit of a question mark for you because to a degree at the beginning, it might as well just be merged with your personal agent. Because you can have rules and parameters of like what you should code and why. and it should have rules of like how to read where things are up to in the code base. For example, if I change a bunch of stuff in the code base, your agent should know what I've changed.

Like easily though, they don't have to scale the whole code base to know what I've changed. It should be in those top level markdown files, right? And if you change a bunch of stuff, I want to be able to see it on my side because you've updated the same Markdown files that are on GitHub. Mm-hmm. You might you might add new features, bro, which means that we're with fundamentally changing the map of our feature set of Secureworks Ops. SecureOps.

And there's no way of me knowing about it unless I had to scan the entire code base. Mm-hmm. literally play with the UI, then I have it in my own brain. There's no way for the agents to know about it unless it sits in those top level markdown files, right? Yep. But it's going to be a pain in the ass for you to remember how those markdown files are structured. So that's why you write it down and put it in the instruction manual for your agent. Like, hey, these are how all of our markdown files are structured.

If we start working in this area, make sure you read. X, Y, Z. so that your context is loaded up to the current state of the code. Yep. And then you can begin to code away. It already has information in there to say, when you have finished coding, Put it all back in there. Because Because protecting the context of your agent is very important. Because every time, you know when that compaction thing happens?

The compaction?

Yeah, autocompact, you know, when it goes like... When you're in a chat for a long time and it goes compacting, please wait.

Maybe I've not been in a tournament that long, or maybe I've seen it and just forgot it. Are you in front of a terminal right now?

Yeah. Click forward slash context, like right forward slash context into the terminal. Thank you.

forward slash contact — Oh, thanks. Yeah. Yeah. Got it? Yeah, we see a bunch of... Context usage. Okay. 12%. Okay.

Yeah, yeah so Hang on, that's just for...

Sorry, the context you used, is that for the entire... Like plan or is that just one terminal? One terminal. Yeah, that's just one term. That's the one that I don't... That's the ops one.

Yeah, so that terminal... It's only drawing from that context That's how you have to understand it is no terminal knows nothing about you unless what it draws into its context window. then it feels like it has memory over that stuff that's inside of the context. Mm-hmm. But context is not infinite. Can you agree with that? Yeah. So when context gets over 40%, apparently that's the sweet spot. If context gets over 40%, it actually starts to cook itself.

But AI doesn't cook itself in the way that... Humans do. It cooks itself in a sneaky way. It thinks it's still outputting the same quality as before, but it doesn't. It's wrong. And that's the trick. is that it acts like it's understanding everything properly and still outputting the good quality code. But actually, its memory is now crap. And we're thinking that it's like recalling all this stuff, but it's not.

I agree with that because I've experienced that myself, which is, yeah.

So, yeah, keep going.

No, no, no. Thank you. That's been that.

But yeah, basically, so... You have to keep that context under 40%. So the way to do that is you don't let that operations guide or that agent or that coding agent read all the code bases and do all the code work. Instead, just let it read the summaries. So that agent becomes an orchestrator. And it stays high level. So it stays zoomed out. And it gives more directives and outcomes. and plans. Then you take those plans and put them into Other terminals.

So you bulk open all those other terminals. Then you let that terminal do a bunch of exploration, coding, work. And you just send its plan back into the orchestration terminal.

Back into the orchestra. Okay.

So now the orchestration terminal, if you think through the day, Say for example, I say, okay, I wanna start work on SecureOps calendar feature, the scheduling feature. So now You brain dump into your orchestrator. which is like say either your coding agent or your personal agent or they're combined as one. And you say, okay, I need to make this change. You explain to it what you want to change and why.

And then you say, Ask me questions until we reach a shared level of understanding. Ask questions, question, question, question, question, question, question. And then it says, okay, we now have an idea. I now have an understanding of what you wanna do and why. but it has no understanding of the code base. Right? So now you say back to it.

Okay.

So now we need to audit the code base, right? And then they'll say, yeah. So then you tell it, or ideally it should have this in its markdown files instructions. it now spawns five different plans for five different agents. that are all going to audit a separate stream of information. You copy and paste those plans into five separate exploration agents, which is five other terminals that you open. They investigate, they explore, whatever.

And at the end, they have some findings, which they either output as a markdown file or as text. You copy and text all those five different things back into the orchestration agent. So now the orchestration agent has all the value of the exploration, but it didn't have to fill its context window.

Okay.

Does that make sense? Hi, Nose. Hey. And then you say to the orchestration agent, okay, you have five audits now. Synthesize them to create one understanding of where things are truly at. Now it gets that understanding. Then you can say, okay, knowing what you know now, do we need to change anything about the plan? Yeah, let's change the X, Y, Z. Okay, give me the new plan. Here's new plan. And then you say, Okay, I'm now going to take that plan and put it into a development agent.

And you close down all those audit agents and you put into three development agents. and they start coding away, bang, bang. then they finish coding or they come up with an issue. You take that issue back into the orchestration agent and say, "Hey, what do you think?" Okay. then it gives instruction. So basically it becomes, the coach or the architect or whatever. And it keeps everything aligned. but you never run out of context.

I kind of understand what you mean.

Yeah, and then it ships out features. Yeah. then it's gonna ship out features. Then by the end of the day, you say, okay, we're finished for the day. Can you, you know, I'm about to close you down. then everything that you've done there, it has instructions to update all the corresponding MD files. So none of that is lost.

Hmm. Mm-hmm.

Does that make sense?

Yeah, I've been doing something similar. So especially with like more complex, like coding work what i've done is it kind of saves itself like i'll tell it to save because i know it once it closes it forgets everything Yes. So the next time I open it up, I say, "Okay, can you read this MD file?" To get in context for what I did there, and then now you do that.

Or say like I've got to leave a store shop or something. I have something after that. Now save it all into an MD file. The next time I open it up, just open up that MD file, read it through, and then we can pick up the protection.

No, that's exactly it, man. That's exactly it. Except instead of just letting that MD file be purely a storage of information, Let it contain instructions as well. and routines and custom loops. and let it know stuff about you and how you operate and what you want to do.

Do you think an easy... No, continue, guys.

That's pretty much me done, bro, for the personal agent and the coding agent. The only other thing to add is that we have an operational agent.

That's Jarvis.

Now the operational agent, and what I mean by that again is just a Markdown file or a series of Markdown files. But essentially that markdown file should have explicit instructions to whilst it's working with both Sean and Manan, if it learns stuff along the way, save that information into itself. so that in the future, It can run autonomously based on the information of how we do what we do and why we do it. purely operationally.

So that agent, you actually do your work through.

For example, create the 50% invoice for XYZ client, send her off XYZ. inside its markdown file, it should have an instruction Whenever I ask you to create an invoice, Never, under any circumstance, send it off without approval. And when you ask me for approval, show it to me this way. So there's a lot of complicated instructions that we want to bake into that thing and we want it to compound over time And eventually that is going to increase in its inner autonomy.

and it's going to become Jarvis. And then we're gonna change the markdown file from existing on GitHub We're going to put it on railway.

Which is the cloud-based thing. Yeah. It sounds like a lot of the things that you're saying is just a compilation of what...

I think we both have been doing... I think a lot of what you're saying... It's just a compilation of the things that we're already doing manually. For example, don't send off an invoice, like "Draft it here", only send it off when I say "OK". So instead of me typing that every single time I raise an invoice, it's just going to read the NMB file, know the instruction, and then every time I ask it to raise an invoice, it will automatically ask me for it.

Sending it up. Is that correct? That's correct. Okay, yeah.

But can you understand how that will compound over time?

Yes. Obviously, because that MD file is going to grow and grow and grow the more you ask it to save context and instructions.

Exactly, man. And you can understand how, it's difficult to just bulk transfer that information into an MD file. It kind of needs to learn it on the go. Yeah.

But it's also — Like we can definitely try.

We'll put in heaps of stuff at the beginning. Mm-hmm. over time, it'll learn how we do things and why we do things so that when it graduates in autonomy, it doesn't just do random crap. It works exactly the way that we want it to work, you know?

Yeah, which is all in those MD files. practical side of things that come out of this, what I'm thinking of is I think you just said it. We've got to do a bunch of things at the start. which is manually tell it like, these are the instructions, these are the parameters. So it needs to start with one MD file. Yep. And then at the end of every session, What I'm getting from you is that to save all that as context, And to kind of load up the same MD file every single time we open the terminal.

And yeah It keeps doing that.

It's like compiling, compiling, compiling. So it's got eight instructions today. Tomorrow, we get another eight. By the third day, we'll have 16 instructions before we even open the terminal.

Yes, that's right.

Yeah. Yeah, that's right. Exactly. But you can also understand that when we try to Uh... When we work with that entity file enough, you can understand that there'll be a lot of information on there.

Yes.

And the way that that information is structured needs to be easily queryable by The agent. And if it's not easily queryable, we come to the same issue that we had before about it overloads itself on context and acts like it knows stuff and it doesn't and it forgets it all So So if I'm getting this right, what you're trying to say is...

If we shove everything into one entry file, the assumption that... It's very easy to go off. The easy assumption is that as long as I ask it to read that MD file, it's going to understand all the context. But because it overloads, like you said, over 40%, it goes through it.

Right?

um that's right there needs to be some sort of library almost like a library Um, That is easily accessible by the AI. And that is either on Supabase. Sure.

for things that might change, but principles like company principles, company information, the way that we have agreed to do certain things that because there's like a barrier.

Yeah, that's right.

So usually what would end up happening is we don't store all the information on that MD file because It'll be absolutely cookery. but we store indexes of the information and where to find it on the MD file. so that When we ask it to do something and it's unsure about how to do it, But for that conversation, we're dealing with invoicing, right? Then it should read a manual for how to invoice or something or the SOP for invoice. But before that point, it shouldn't have read how to invoice.

It should just know if I want to send an invoice, make sure I read how to invoice first. Yep. And it should understand It should have an index for how our wiki is set up. On GitHub. Because it needs to know, it doesn't know everything that's inside it, but it knows it exists and it knows everything. what order it's put in and how it's structured. So if it wants to find that information, it knows exactly where to go to get it.

So I'm assuming you're fixed.

When it goes there to get it. Yep. There you go.

And I go for it. I'm assuming what you mean is like There will be one — Um. Good. There will be one.

And D files are almost like filters, aren't they? Because you want them to produce a certain result. So...

There will be one filter that goes, okay, if you want to invoice, go to index number four, which talks about invoicing, for example.

which we then need to have on the up that we have this system where Number four will be about invoicing and there's just a bunch of information and instructions on invoicing.

Yeah, am I getting it right?

Yeah, pretty much. The MD file is like a map or a blueprint. Yeah. Yeah. instruction manual. It doesn't contain all the information — or it's a directory. It doesn't contain all the information, but because it would be too much. Bye. All of the information that the map is accurate to what is live on our system. For example, it doesn't have all the information that sits inside Supabase. but it has the outline of how we store all of that information.

Now, I don't even personally know how we store all of it because I've never even looked at it once. But the AIs have written it. So there's like, I wouldn't have an idea, but let's say there's a hundred different tables. And there's thousands of things inside every table. So it should know that there are 100 tables and these are what the tables are for, but it doesn't know all the data inside the table. For example, the MCP tools.

It should have a list of... What MCP tools exist and why, how they work. So that when you ask him to do something, it calls the right tool to do it. Because if you have too many tools, it gets confused and it calls the wrong tool, thinking that it's the right tool. And that's something different than what it expects.

Yeah, that's been happening a lot. I think that has happened before, yeah. Okay.

So, 'cause we have so many different edge functions like, We need to bring a level of consolidation to our edge functions. We keep them simple, like they're supposed to stay one tool each, not a string of tools. But for example, when we set up a routine, then we can have written down what strings of tools sit inside that routine that it does every time at x. 5 p.m. every day. Do this routine. Then I was, okay, I'm going to call this, this, this, this. I'm going to output it this way. Then I'm going to get menu review here.

And then I'm going to do that back. Now, once that routine is stored there, Yeah.

It's just amazing.

So instead of operationally, you don't have to say, Uh, You find out. what's outstanding right now or whatever or you know, what's on for this week or... I don't know how, you know, you know what I mean? Like there's things that we can do. For example, Yeah, for example, for the sales guys, I just set up something for Nitin. where We got his terminal. to query the past 50 most newest inquiries. pull all the information from the conversation and put it into an Excel spreadsheet.

with a drafted text for the next response. So then it worked for a while and the output was an Excel spreadsheet. And Nathan just edited the last table and he said, yep, send this one, send this one, tweak that message a little bit, bang, bang, bang, bang. And then it sent out 50 customised personalised texts that were the exact correct text for that moment. Which was great, saved him an unreal amount of time.

But now the next step from that is, Why not convert that process into a routine that it does automatically? actually, why don't we add two processes, one process for Texts to follow clients up. The other process for pipeline hygiene So if it can query the conversation and it picks up any information inside the conversation from address to name to email address that we don't currently have on our Supabase database, It should fill it in.

So now we have two processes. Now we have a continuously updated database. And the second one is constantly got the right messages automatically sent for that exact individual's context. Now take it a step further. We can automate a transcription of every phone call Through an API. and send that into Supabase. So now we have A very rich context for every client saved onto our database. That's one step.

Now the second step is on that same automation, It should identify when is the appropriate time to call clients after the quote's been sent. because now we changed the automation and say query super base itself Find out how much the quote was sent for, what the quote was, what information's on the quote, When was it sent? And if it's time for Nathan to do a follow-up call, tell him, do the follow-up call today.

And we just run both of those processes on a Monday, Wednesday and a Friday. So now, Nithin, no longer needs to devote any headspace to follow-ups for sales outside of making the phone calls and editing their spreadsheets.

Is it automatically — Pretty wild.

So all of his headspace that was devoted to, like, who should I text or is anyone outstanding, whatever. He knows the pipeline is like so good. And that process of sending the text, once it gets good enough, He can just give that to his agents. Now his agent's constantly sending the right texts at the right time. And it pings him and says, hey, you need to find this person today. Here are your 10 phone calls for the day.

Call them please. I'll review how the conversation went. because we've got the transcription now fed in to the system. Mm. And Now. the friction between nothing and selling. is literally all he has to do, because also we set up something that it auto-books everything on his calendar. So when clients like he can have a phone call with a client and say, okay, I'll see you Monday night. then there's a webhook that happens after that phone call. It pings his agent.

His agent takes the transcription of that phone call books him in on his calendar. So now all he has to do is answer the phone and rock up on site and send the quote off on the tool. Everything else is fully automated. and it's consistent and it's measurable. It's done the same way every time. It's high quality. Okay. So basically it means Nitin's output is increased very significantly. And his headspace has been freed up hugely as well.

Hmm.

I got it.

Okay. So I'm sure there's many routines and automations and stuff that you can set up as well like that. Just don't set them up inside max lead anymore. You gotta send them up inside the MD files. And you can run it through the terminal. That's the one way of doing it. The full level up is when Jarvis runs on railway. Huh? It's not right now. But in between those two stages, there's the exact same thing of the terminal doing it and you telling the terminal to do it, but you can put that same routine onto Claude Code on the app.

on the actual, if you download the app itself? Yeah. Not in the terminal. There's something called routines. and you can bake that same structure for Float code. and you can set a time for it to run. consistently so you can say every Monday at 5:00. And it'll just run on the cloud, bro. So you don't even have to have your laptop open.

Hmm. But the agent that you're talking about, because you mentioned agent and then... You've said it a few times, the agent is the end default. What? This.

Like what if anything created that's not the MD fund itself isn't it? It's much more important. On railway, I'm assuming?

Yeah, so think about this, bro.

What is an agent? Um.

It's hard to understand, bro. I don't fully understand it. Yeah, have a go.

I think what an agent is, is an artificial human being Um... that does your tasks. Within the instructions given right?

so And then D file, or at least the way I see it, I could be wrong because I don't know. I won't say I know too much about this. I literally learned it when we started doing this whole thing together. Um... But an MD file is more like Contacts, instructions. So what I understand of an agent is that it is almost like an external... Brain?

That uses the MD files.

to do whatever you ask them to do.

Yeah, I'd say so, man. I think we'll wait.

Yeah, keep going, keep going. No, just like, Niffen's thing at the moment, once it's running off, like, just cloud code, or? Like that whole Monday, Wednesday, Friday thing. Yeah.

Yeah, so... Um.

He still lives in his terminal, right? Like the spreadsheets and stuff. He still has to give it the manual. Okay, send it.

I've edited this spreadsheet. Obviously, Cloud Code can access the spreadsheet.

And then therefore it sends off the messages. Is that correct? Or is it an external thing that they're not?

Just give me one second, I just gotta write this plan.

Do both together. Isaac. Um... So basically A way to understand it is that an agent is just...

A execution of a long set of instruction. Yeah. So you can understand how We tell Claude Code to do something. Claude Code is an agent, but... What Cloud Code is doing is it's basically been told convert this text file into code that you can then execute. That's its instruction set. But then imagine if at the end of an instruction set you say, Uh... I don't know, basically just like, Come back after 15 minutes and check again.

Now you have the feeling of, it feels like it's autonomous. It's there all the time.

And that's basically the difference.

An MD file is essentially an agent because It's got a memory and a personality and an instruction set that lives independent to our own. Whenever you open the agent inside that MD file, it takes on the persona of that MD file, right? So that's one way I've been explaining agents. But then imagine if instead of that MD file being a new instance every time you load up Claude code, Imagine if you just added a thing that just said, Yeah, I want you to run, but just stay awake the whole time.

So I don't need to be able to tell him enough for it to do that. It could just do that because I...

Okay, that's — Well, that's, and if we go to railways, that's when, That's when Jarvis gets to that level. So Nathan's just got his own agent living on railway as well.

Okay, that's that's my bridge on the sandal. Yeah, because my understanding of yeah, I'm Yeah, okay. Okay. Okay. I get your point now.

I You're basically creating agents, but they're prompted every time. Yeah. The difference is with the autonomous one is that it stays awake the whole time. and you can ping it with webhooks, which is the same as saying an event trigger. So say any event happens, when that event happens, trigger the agent, Do this.

That's a webhook.

So like a phone call finishes, that's a sign to Nithin. Trigger the agent with the webhook of the transcription of that phone call. And then it'll wake up and go, oh, I've just read this information. Well, what do I do now that I've read this information? I've been told, check Nathan's calendar, see if there's any available slots. This is my instruction manual for deciding when to put it. Now that I've decided when to put it, place it and notify Nitin. Places it, sends Nitin a text.

Okay. So, it's a legend. The personnel agents that we're going to build, that lives on Railway. Because Railway is the only way that it can stay awake, basically. Am I right?

Yeah, Railway is just a cloud hosting platform. Correct. If you left your computer on 24/7 inside the terminal, it's the same.

Yes, yes, yes, yes. Your PC just has to run all the time.

Correct, correct, correct.

Imagine if we set up web hooks that feed into your terminal, then you have the exact same as what Nitin has. That's why, for right now, we don't need everything to be on railway.

There's no point because you're going to be working an hour's day anyway.

Yeah. So however, the gold is what is in that MD file because that's so valuable. Once you set it up, it compounds infinitely. I mean, well, yeah, to an extent infinitely, but you get what I mean.

Yeah, that was the confusion for me because whatever you say, that sounds great, but I don't see how it was going to be able to work off. Like a local thumbnail. Because that doesn't make sense. But then you mentioned that it's Railway that makes more sense.

So the practical thing that I take from this is we save the MD files with context every single time after the session. But where we save it to is where we kind of need to do work on the wiki, basically. On how we save it.

Yeah, and that's going to take us some time for the wiki, but the short-term takeaway is... Just for everyone. Yeah. Well, you have to actually create an MD file called... Yeah. Sean's personal agent. And another one called ops. The ops one will share. So whenever either of us work in the ops MD file, Thank you. Um... We both pull from the same file. And what that does is it basically makes a copy of the folder on GitHub or the text loads it into our individual terminal.

And then when, When we finish for the day, it's going to write back into that MD file. We'll just put inside the ops thing. This is what Manan's worked on. This is what Sean's worked on. But to be honest, man, I'm not going to touch that ops thing too much because you're managing all the ops. Yep. But I am going to just add context and understanding and stuff into there.

Yeah, that's fine. As long as that...

As long as they're the lines, it's fine. The only thing I... The issue is, for example, Um... I'm not sure if I've mentioned to you the stages. So I believe you've set some stages before. And then now that I've updated the Kanban to the stages that I'm uncomfortable with, there were a lot of jobs that disappeared because it still recognizes the stages that you've set. So it doesn't appear on the offstage, it just sits in Supabase.

With that stage, it doesn't appear. So in a sense, it's back then and front then.

So that's, well, that's a good way to think about it. That's exactly what's happening.

Yeah, so I think the fix for that would be if we pulled... I think if we share the same MD file, I feel like it'll be fine. Because all the contacts would live there, wouldn't it?

Well, the thing is, right, so this is a great example. So I've obviously gone on one of my terminals, an explanation of what we've set up inside Supabase, why we've set it up. and what we did. Now that information should be written down as an ADK or a developer's node or whatever. and it should sit somewhere so that when you're trying to now create your Kanban notes, you see there that, okay, what we've tried to do is...

On Supabase, establish a source of truth across any job, independent of whether it's a fencing job or a patio job. Mm-hmm. And that's what I did try to do is I tried to establish a process that'll be the same 10 steps, no matter what type of job it is. Now on the back end, it looks like that, but on the front end, it has like a little micro stage inside the stage, which is what you wanted to show us.

Yep. Because somehow we need a way for patios and fencing to follow the exact same process, even though patios has council and engineering and this and that. But the source of truth being super base, it needs to track where it's at at each stage and have reliable rules for each stage. because for the operations MD file, it needs to tell Jarvis when it's allowed to Move the job on. Hmm. You know what I mean?

So there's only one other thing which I want to tell you is, and then I'm going to go for the day and I want you to just... I want you to just be a beast bro and apply this two more things I'll tell you and then I'll let you go One other thing is that what I've learned in trying to build Jarvis and a part of the reason that we're not building it right now and focusing on the system is You want to reduce the amount of compute that the AI is doing.

It should not be — It should not be the... Uh...

What's the way to say this? Let me say it this way. The actual job management system itself should be the one that is doing the heavy lifting. Thank you. The AI agent is just like a small little rudder that enacts change upon the system. Thank you. But if you can reduce how much the agent's doing itself independently with its own reasoning, you produce a better performing system. What I mean by that is...

Our system primarily is built off of, let's call it 10 different job stages. And certain rules that pertain to that individual job stage. For example, When a job is in this stage, this is what we know to be true. This is what the world looks like for this job. In order for it to move from stage one to stage two, XYZ needs to be true. Now once X, Y, Z is true in this sequence, we have now permitted That job to move from stage one to stage two.

Yeah. that reasoning would end up being very different sometimes.

True.

Okay, I've seen that. And it would just, Yeah, so...

What you want to do rather than that is let the system be the gate. So the system itself is checking and the system itself has an automation that says, check if X, Y, Z is true. Oh, X, Y, Z is true. Okay. Move it to stage two. We can just hard code that in there.

Now the AI applies the land reason...

When you say the system itself, what do you mean by the system itself? Like...

I mean, literally coded into SecureOps.

Okay. Got you.

So an example of this would be, When a quote is sent and we have a query goes to Supabase that says, Um, quote has been viewed by client. a web hook fires to Secure Ops. or whatever, I don't know how it works or fires to its own database itself. And it now moves that stage from quote needs to be sent to quote has been sent. Yes. Do you understand that we need no AI for that? Because it's just... X, Y, Z happens and then therefore it moves from stage one to stage two.

Yeah, so we don't want to code that.

Yeah, we don't want to code that into the operations, it's into Jarvis.

What we want to code into Jarvis is more like when the quote's been sent, I haven't replied in a few days. Thank you. I don't know. I don't even know what we need to code into Jarvis. We'll find out that. But for now, the rule is basically as much as we can automate without having to engage a complicated AI reasoning loop Just automatically first. Once we've maxed that out, then we can add jobs in there. Okay.

I understand what you're trying to say, but I want confirmation because we had this conversation about automations, I think last week or two weeks ago, and then you said don't automate anything yet. because there was some It was something to do with Jarvis.

Um... So... What I just to be on the same plane. You're saying to automate on secure ops itself? Which is what? I also want to do because it's just simpler.

So what we could do on SecureOps itself as well as when, say I stay on a terminal, the code has been sent or it can do it itself. Um... Just that if I manually say, oh, you know, the quote is this amount, move it to this stage. Automatically, what it should do is move it down the pipeline, move the stages, and then whenever it's at that stage, it'll just be like...

What we set up on GoHighLevel.

That's right. That's exactly right.

So all of the level of automations we could set up on Go High level, we did it without an AI having to do it, right?

Yes, and we can do it now.

Yeah, but rather than that automation living on Go High level now, just make it live on Supabase. Yeah, which is, and Supabase. So it's still simple automations, but it lives on... it lives on Supabase. So we don't need an AI to query that.

And that includes internal.

I have a big smile on my face.

Yeah, because when the... When you send off a quote, right?

You don't need to tell your terminal, okay, now the quote's been sent off, please change the job stage.

That should automatically happen, right?

Correct. Because when they approve it or when they've opened it, it should pick up by itself.

And we could use that as a trigger. Yeah.

That's right, but I think potentially two weeks ago, I was under the impression that the better way to do it is let all that automation go through Jarvis. Now I've learned That's not the right way.

Yeah.

Jarvis is still going to end up doing crazy wild stuff for us. Yeah. But it's not going to be that kind of thing. That kind of thing we can just do through automation.

Okay, perfect. I've got my work cut up for me then. That's one aspect of the work. Yeah.

Okay. That's right. So now that's a huge unlock for you and for me as well. But when you do those automations, you have to record somewhere. What automation you built, why you built it and where it's up to. in the right MD file so that I can see it. So I don't retry to do it or whatever. That's one thing. The other thing is you need to set up Your own personal agent, your own coding orchestrator and your own operation or Jarvis MD file and we're going to share all three of those for now just put them all on GitHub and I'll have a look at them as well and keep them up to date Now the final thing is...

What I'm hoping you get time to do this week is... If you can, if you can't, it's okay. But if you can and you get time to it. audit the bookkeeping process. see how we can automate that so we can eliminate the bookkeepers. Thank you.

Okay. Okay.

Is... So...

Where your head's at, you're 100% dissatisfied with.

Not comp, like I am dissatisfied. The charges too much, but I'm not a hundred percent on whether we eliminate them or just do automate a bunch of their work and keep them on like a, Maybe a monthly review or two weekly review or, you know, they stay weekly, but that charges 250 bucks to 550. I don't know yet. One thing's for sure, we can automate a hell of a lot of their work and do it for free. rather than buying them so much.

Right off the bat, the simple things like receipts, That...

Should be able to be done on zero itself. So the only reason why they're doing it is because they're verifying Bank payments. to the invoices that was raised.

Am I right?

Yeah, pretty much, man.

I mean, the receipts is probably one of the only ones that it's like... That's gonna require a mix of automations and coding, but it also requires a mix of coming up with a SOP for how we as a business will then operate with receipts and purchase orders. and the edge cases of like, okay, what about Bunnings? Well, Bunnings auto uploads their receipts to Xero directly through this API. That's the only thing that does that.

Bunnings does that like that. Now, when we order from a supplier, they send an invoice back. Sometimes they send to the wrong place. So that's why we should have a PO. So if we ever don't have that invoice, we can ask them, hey, check under your system for this PO. Now, when you go in person and you buy fuel, then you get a receipt. So someone needs to take a photo of that receipt and upload it. But at the moment we're using WhatsApp.

So it has to be a manual process from WhatsApp onto Xero. Now do we just use the receipt capture process? Do we put it in the trade app and put a receipt capture process there for reimbursements? That's the kind of thing. But that's actually probably one of the most complicated ones for that. The simple ones I like. For every invoice we made. Yeah, well, for every invoice we make, is everything transferring over to Xero?

perfectly every single time. What about for more complicated situations? Okay, now that. Now, what about when trades make their invoices? Are they making it in the right way? Are they forced to make it in the right way so there's no mistakes? Okay, now that's gone. So that's two big processes we can eliminate immediately. Now the receipts purchase orders expense one is probably one of the more difficult ones, which you do after that.

Then the only other thing that they do is, They raise the pay every week, but Esther can do that, so I can automate that one.

Do you understand what I'm saying?

The payout. The batch payment. Yeah, the batch payment. Because it takes how many bills are there this week and then it... in a converter.

So I'm going to leave that there. See what you can do.

There's a lot of work cut out for us. Yeah, that's a lot of work cut out for us. I am going to try to finish the data flow. That's my biggest priority. And inside that, What I've realized is we need to add a stage or two to the scoping tool. So I need to beef up the QA process.

Is that...

when they finish the scope. The QA process is a bit more exhaustive. If they pass the QA process, that a lot of information gets sent to Supabase the correct way every single time. And then after that, the job stage itself fundamentally changes. So when we review it, we enter into a forced read-only mode that captures the exact instance of the scope being sent out. So we don't have like, and when there's an iteration that happens, for example, Nissa needs to change the code to change the color or the size or whatever.

It unlocks itself, enables changing, locks itself again, like that kind of thing. And then also, All the data that has then correctly flown into Supabase, how does it show on ops? How does it show on trade? And then how does it all show on the sales side and how does everything show to zero?

That's basically it. If I can do that, After that, I'm gonna move into the sales data, which is the end part of that thing.

And the sales automation. So that for me right now, that's my biggest ROI is getting the data flow done and then automating the sales process so we can get more sales because the boys are doing They're not doing a bad job, but there's definitely a lot that we can improve on. Like now with Nitin, I think our follow-up will go through the door, through the roof with the sales.

and we'll be able to get more work in, which would be great. And then we just tighten up the rest.

Okay. So with the data transfer, Yes. I'm not going to touch anything that...

has to do with the scoping tool not talking to the OpsDash.

For now?

Yes, that's right. Yeah, don't touch that. You can send it to me what you have and I'll incorporate it into my thing. But I'm doing like a really in-depth one. So when I'm done, it should be like bulletproof.

Okay. But anything else you can play with like UI stuff. But again, just remember this all sits inside the 70-30 of right now you're 70% ops. 30% code. So I never want to hear the situation where like say this fire or this issue happened, but I was busy coding. Like that shouldn't happen in your role because your priority is ops right now. Yep. but I do want you to implement this method of having the different agents.

And I'm okay to an extent if you tweak the three agents, like maybe you just want two. but I want you to begin using that. So... And I want updates to be able to send to me easily and I want you to incorporate the tasks maybe you use through your Notion Task Base or whatever. You can even use both bro, you can literally set up your agent to extract from Notion via MCP. and extract from Todoist MCP have both of your tasks in context.

keep you grounded on the biggest priorities for the week. and have your update loops of like logging the reporting and all that stuff. So you don't have to, I mean, it'd be great if you don't have to do a manual report because it's just doing it automatically. I never have to ask you stuff because it, It just does it automatically, perfectly, you know, and then it's just like, It's just a way better way of operating, you know?

Okay.

Okay, bye bye.

Hi man, we've covered a lot.

I'm tired right now, but I'm glad that they took notes, man. Send me the notes of what it took as well. Yeah, I will do it. And then you can plug it into your terminal as well and then we'll start works.

Okay. So just to write off, I'm going to review what was talked about today, obviously, but Right after this, but the thing that's on the top of my head just to make sure that I get it right Some of the few things, is the three agents. So creating those three agents or essentially three markdown files. Yep. Followed by the automations for the OpsDash. Thank you. And then if there's time, don't leave both the bookkeepers and see what we can take over.

Yeah. Will that be it? Will that be it?

Yeah, I think outside of that is just begin to use the wiki.

So get your terminal to start querying the secure docs wiki on GitHub. and see what other information you can extract there because that's all stuff I've been working on. So I basically uploaded all my MD files onto there. See if you can add stuff or whatever.

Of course, don't change it too much. Have a read of it.

Do you want me to add my stuff onto there?

I want you to add only the gold, bro. I don't want you to change. But to be fair, I haven't.

Like, I haven't fully manually reviewed what's on there either. So I think there's a lot of quality on there, but... There's some stuff which might be cooked, I don't know.

And the index for Supabase as well, because...

We don't really know how it's thought and I don't even know if I've written one, though, to be honest. I don't even know if my agents have one. But you will probably see — You'll see some stuff written about the CIO. on the secure docs, which is the agent I'm using to help me code. So feel free to read it. Bye.

But let your terminal read that and gain an understanding of That's where I'd spend your first amount of time is plug in this meeting into your terminal and also read the secure docs. And read the CIO stuff. and begin to brainstorm about how you can set up your agents to work with you during the day.

That's probably the rest of the day, man. Okay.

And then get your workflow going of codecs. for your orchestrator. Because again, that codex is just a tool that's pulling from one MD file.

Like you can run your personal agent through Cloud Code or you could run it through Codex. Okay.

Yeah, I mean, not at the same time, but. You could run at the same time, but it'd be hell of a retard.

Yeah, I'll be to the side with — Codex.

Yep. This is two different dominoes, yeah. Yeah.

Okay, man, that's enough said about that.

And, yeah, I'll let you go with that. I think there's enough to run on for today. We'll talk tomorrow again.

But question for you is how... How did you find this morning? Did you get a good chat in with anyone?

I had a great chat with John.

Oh, nice man.

Frankly, when I heard the whole thing, I was like, oh, this prayer meeting, this chapel's going to be the shortest. Chapel ever. We're just going to have a 10-minute conversation and then call it a day.

But we ended up talking for about 30 to 40 minutes, I think. It's amazing, man. Yeah, it was a good chat, man. He just got engaged, I think. Last week. Oh, what?

I didn't even know.

Brother got engaged!

Oh, man. I would have shouted him out. I didn't even know.

He's a... From what she the lives that he gave is a little bit of an introvert I feel like John's one of those people that that secretly attracted You just have to unlock it in them and they're just the best people to hang out with.

But it was really a good conversation, man. I had a good chat with Isaac as well. Isaac with Ryan. That's awesome.

I think early this week, last week. Yeah, I'll make it a point to give some people a call throughout the week, at minimum, like two or three of them. Good work, man. That's epic.

Perfect, bro.

And then just a general check-in.

Yeah, keep going.

No, I was going to tell you a little bit of a question for you.

The common trait that I get with talking to a lot of these guys, just that... the goal that you're trying to set, which is to create an environment of godly men, working together, of course, like business, profit and whatnot. But The main goal at the end of the day is to become more like Christ.

I think that's working, bro.

Because a lot of the comments that these guys leave when it comes to secure world is the first thing they say is, like whenever I just said the environment forgot the man.

John said the same thing. He's worked in a bunch of other places. There's really not a company like that.

Wow.

Great stuff. Yeah. I appreciate it. I really appreciate it, man. It means a lot.

You know, it's... Yeah. Not that it's difficult, but it's more just like it's... It's hard to Get eyes on it sometimes because you're in it, I guess. It's hard to make sense of it or gain visibility because it just feels like You know, it's just normal to us.

But, you know, that is like our heart's desire, man.

So it is encouraging to hear that. Like, I don't... I really value feedback from the boys that... I think is genuinely honest. Cause like I can ask them and they'll also tell me how they, they're always honest to me, but yeah. I guess there's always a degree of filter that's like, You're their boss. To the boss, so to speak.

Yeah, you're the boss.

So it's, yeah, to a degree.

Mm. But, yeah, so it's encouraging to hear that, man. I really like Sean. I'm glad that we have a space for him. Yeah, that's amazing.

That's great. Anyway. That's that.

I'll get on to some of the stuff that we talked about.

Okay, man. like as more of a chicken sign of things like What do you think about all this stuff, bro? It's pretty interesting, right? Did it?

The joke that I tell people, because a lot of people in Malaysia know me as the lawyer. Because... The way that I talk to people, the way that I think, like, connects and whatnot, everyone thinks, like, okay, this guy's going to do law. And we've talked about this with a lot of people. Like, the circle that I'm in, everyone's like, oh, you're doing law, you're doing law.

Then when I tell them that I'm doing construction, I go, what the heck?

First of all, I know nothing about construction. And then the kicker is that I'm not even doing construction, I'm doing coding.

Never touched coding a day in my life. But we're talking about... you know, edge functions and agents and AI and, you know, future-proofing the company and whatnot. Yeah. I've never done any of this stuff, but it's exciting for me.

It's the same thing I told you at the start when you, uh, not at the start, when I came back from the honeymoon. The arbor oil roll's been replaced.

I was like, great! Let's, let's... It's exciting that we get to do something new. So I'm definitely excited in the sense that it's new things, it's a lot of learning, it's new skills.

And I appreciate, I think beyond everything, I appreciate the space to...

Like figure it out.

to kind of grow into that role. So like what the company needs now is someone to develop the systems And what I thought developing systems initially, was, for example, we were using Go High Level, we were using Tradify, and whoever that was using those systems didn't do as good of a job Um, As anyone else could. So when... When that system was implemented, I was like, okay, so I've improved the system. And then in a matter of weeks, we went from, okay, we're not going to use GoHighLevel and Tradify. So that system is now obsolete. Now we're going into coding, now we're going into AI. I was like, oh, okay, so this is a different perspective of...

improving systems, but it comes with a skill. And obviously that skill is something I'm still working on, but I appreciate the space to grow into that.

So, yeah, I love the avenue to learn new things. I'm always up for learning new things anyway. I find that really exciting. So, yeah, what's up?

That's all I can say.

Nah, that's epic, man. That's every girl did I mean the weird thing I mean like neither I saw this coming.

It's just that things have changed but To a certain degree, man, there is no other skill that's as future-proof as what we're currently doing right now. because we're just Like, I'm very hesitant to say this because I know how deep the tunnel, well, I don't even know how deep the tunnel goes, but I could see it much deeper than where we are at now. And I know that we're not like, like there's guys much further ahead of us. That's what I'm trying to say.

But at the same time, I do recognise that... There's a degree to which I would still say we're an early adopter. You know, there's not many companies operating or trying to go down this direction. So in that way, I'd say it's good to know that we're at least heading in the right direction. I wouldn't say that we're... fastest of the best but if we keep at it man like There's definitely a future here and it's really high quality skills that will We will continue to reap the benefit from this learning for essentially our whole lives, man.

Yeah.

We get to play with AI like 40 hours a week.

You know, most guys are still just asking AI to like...

write up a nutrition plan and that's alright it's good still But this is where all the jobs and stuff are headed, man, because this is what companies will need.

Correct.

Even like being a lawyer, like the lawyer of the future will be different to what, you know, what the lawyer is now. Thousand percent.

There's some parts of lawyering, for example, like conveyancing lawyers, where it's template work. So the contracts all look the same, it's just the details are different.

AI started doing that.

So, conveyancing used to be like the place, the money-making field for lawyers.

It just went obsolete in a matter of years, like a few years. Yeah, so... That's crazy, right? Yeah, it's actually pretty scary when you think about it. There was this video on... Cloud design. The two designers, um, Like using it, even they were saying like, this is crazy.

If You know? It's always that, like, if AI can do it, why do I need you?

So the fact that we're indulging in it is great.

It's true, man.

But you can also see how like... Inside this space, there are some things that no matter how good the AI is going to be, you'll always need a company-specific harness. Like harness engineering, I think will be around for a long time. Mm. Like, AIs will get better at riding harnesses, but... It always is going to be complicated as frick, bro. because there's just a lot of information.

Yeah. If we can get skilled in riding harnesses.

You know how I spoke to you the other day about like SaaS, like we might go as a SaaS product or something. Yep. Essentially, what I could see us doing. is building harnesses for other companies. Hmm. through like a parasitic framework where we have put an AI that specializes in building harnesses, but it does so like its implementation of that harness is progressive in a really smart way. So we, you know how we've had, like we've changed systems off try to find stuff and it's been quite jarring.

If we can do that process in a smooth way, We can make a fricking ton of money off of other companies. and deliver very high quality service. But if we have an AI that can... Thank you. because we just built a closed loop of how to do that. how to do what we've done. in a way that works for them, you know? Anyway, I'm not that interested in that right now because we've got our own work cut out for us.

That's not it.

Yeah, I look forward to it.

Again, the start of me being excited for this company was when you mentioned scalability. And of course, it wasn't the way that I thought it was going to be.

But here we are, you know? And... If we're going to go to that place, it takes a lot of skill to go to Vaughan. learning new things.

And the fact that, I think my heart goes out to you because you, You said you didn't code at all. And I hear you talking about code as if you're You've been in the game for like five years, like 10 years, you know?

So...

That thing to me is like, Manan can do it, I can do it, man. It's somewhat toxic, man. It's like, quick, man. If he knows nothing... I can do it too.

Thank you. Bro, 100%, man. I agree with you. And I think you will go even further, bro. I think you can do it. You will be better than I will be, bro. So that's what I'm believing for, man.

I'm believing for it too. Anyway, cheers man. I'll give you updates. Alright man. Thank you. Thank you.
