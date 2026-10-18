# Monster Classroom

Five little classroom tools for nursery and primary, in English. A vibe coding example by AI voor Docenten.

| Tool | Age | What it does |
|---|---|---|
| Noise Monster | All ages | Uses the microphone to measure loudness. The monster sleeps when the class is quiet, wakes up and grows when it gets too loud. Quiet time earns stars. |
| Monster Name Picker | All ages | Every name gets its own monster. Fair turns: everyone is picked once before anyone is picked again. |
| Tidy-up Monster | Nursery & Reception | A tidy-up timer. The monster walks home, collects the toys and throws a party at the end. With music. |
| Ten Frame Flash | Lower primary | Subitising with ten frames, dice or scattered monsters. "How many?" or "How many more to make 10?". |
| Planet Walk | Upper primary | The solar system to scale for your playground: distances in metres and children's steps, real sizes at that scale, a walking monster and printable planet signs. |

Space bar = main action in every tool. Full screen button for the board.

## Privacy

No accounts, no tracking, no AI. The microphone is only used to measure loudness; nothing is recorded or sent. Class names and settings are stored only in the browser on this device (localStorage).

## Techniek

One static HTML file, no build step. Monsters are drawn as SVG by a small generator. Sound with the Web Audio API, voice with the browser's speech synthesis.
