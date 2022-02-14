import json
from copy import deepcopy


likert_scale_5 = [
    {"text": "Strongly Agree", "value": 1},
    {"text": "Agree", "value": 2},
    {"text": "Neutral", "value": 3},
    {"text": "Disagree", "value": 4},
    {"text": "Strongly Disagree", "value": 5},
]

empathy_questions = [
    {"text": "Before criticizing somebody, I try to imagine how I would feel if I were in their place."},
    {"text": "When I see someone being taken advantage of, I feel kind of protective toward them."},
    {"text": "If I'm sure I'm right about something, I don't waste much time listening to other people's arguments."},
    {"text": "When I see someone being treated unfairly, I sometimes don't feel very much pity for them."},
    {"text": "I sometimes try to understand my friends better by imagining how things look from their perspective."},
    {"text": "I often have tender, concerned feelings for people less fortunate than me."},
    {"text": "I believe that there are two sides to every question and try to look at them both."},
    {"text": "I would describe myself as a pretty soft-hearted person."},
    {"text": "I sometimes find it difficult to see things from the other person's point of view."},
    {"text": "Sometimes I don't feel sorry for other people when they are having problems."},
    {"text": "I try to look at everybody's side of a disagreement before I make a decision."},
    {"text": "Other people's misfortunes do not usually disturb me a great deal."},
    {"text": "When I'm upset at someone, I usually try to put myself in their shoes for a while."},
    {"text": "I am often quite touched by things that I see happen."},
    {"text": "Sometimes I feel sorry for other people when they are having problems."},
]

for i in range(len(empathy_questions)):
    empathy_questions[i]["choices"] = likert_scale_5

study_head = [
    {
        "text": "<h2>Study Summary</h2>",
        "is_just_description": True,
    },
    {
        "text": "We invite you to an anonymous user study of our web-based tool for design brainstorming on pressing societal issues. We aim to understand how to effectively design system features to engage stakeholders in discussions of societal issues at scale. The results of this study will be used to derive empirical design implications and published in research papers.",
        "is_just_description": True,
    },
    {
        "text": "<h2>Empathy Questionnaire</h2>",
        "is_just_description": True,
    },
    {
        "text": "Please answer the following questions regarding empathy.",
        "is_just_description": True,
    },
]

demographic_questions = [
    {
        "text": "<h2>Demographic Questionnaire</h2>",
        "is_just_description": True,
    },
    {
        "text": "Would you mind telling us something about yourself, please?",
        "is_just_description": True,
    },
    {
        "text": "What is your gender identity?",
        "choices": [
            {"text": "Female", "value": 1},
            {"text": "Male", "value": 2},
            {"text": "Non-binary/non-conforming", "value": 3},
            {"text": "Transgender", "value": 4},
            {"text": "Others", "value": 0},
            {"text": "Prefer not to say", "value": -1},
        ],
    },
    {
        "text": "What is your age range?",
        "choices": [
            {"text": "18-24 years old", "value": 1},
            {"text": "25-34 years old", "value": 2},
            {"text": "35-44 years old", "value": 3},
            {"text": "45-54 years old", "value": 4},
            {"text": "55-64 years old", "value": 5},
            {"text": "65-74 years old", "value": 6},
            {"text": "75 years or older", "value": 7},
            {"text": "Prefer not to say", "value": -1},
        ],
    },
    {
        "text": "What is your completed education level?",
        "choices": [
            {"text": "No formal educational credential", "value": 1},
            {"text": "High school diploma or equivalent", "value": 2},
            {"text": "Some college, no degree", "value": 3},
            {"text": "Postsecondary nondegree award", "value": 4},
            {"text": "Associate's degree", "value": 5},
            {"text": "Bachelor's degree", "value": 6},
            {"text": "Master's degree", "value": 7},
            {"text": "Doctoral or professional degree", "value": 8},
            {"text": "Prefer not to say", "value": -1},
        ],
    },
]

scenario_txt = "The COVID-19 situation is still full of uncertainties. Even with vaccinations and other measures, the growth of the number of cases is not slowing down enough. Universities have decided to keep in place agile working approaches. While suggesting to work and study from home as much as possible, they allow people to return to the shared workplace. However, facility managers and people responsible for on-campus activities need to define working policies that both satisfy people's needs and government guidelines. To do so, they asked people working and studying on campus to express their opinion on this matter."

scenario = [
    {"text": "<h2>Back to Campus from COVID</h2>", "is_just_description": True},
    {"text": scenario_txt, "is_just_description": True},
]

opinion_1_txt = "The university should not allow people to work on campus, and all activities should be online."

opinion_2_txt = "The university should only allow fully vaccinated people to enter the campus."

opinion_3_txt = "The university should support the hybrid setting to enable both physical and virtual presence (for example, using scheduling systems or masks)."

opinion_4_txt = "The university should only allow education activities on campus, and no other activities are allowed (e.g., social gatherings)."

opinion_5_txt = "The university should allow people to work on campus without restrictions."

opinion_before = [
    {
        "text": "What is your opinion on the scenario, based on your assigned role?",
        "choices": [
            {"text": opinion_1_txt, "value": 1},
            {"text": opinion_2_txt, "value": 2},
            {"text": opinion_3_txt, "value": 3},
            {"text": opinion_4_txt, "value": 4},
            {"text": opinion_5_txt, "value": 5},
        ],
    }
]

view_array = [
    [
        {
            "text": "<h3>Imagine you are a Bachelor Student</h3>",
            "is_just_description": True,
        },
        {
            "text": "<ul><li>You are a new Bachelor's student enrolled in Miskatonic University.</li><li>You just moved into a dorm on campus.</li><li>You still keep in touch with high-school friends who live close to the campus.</li><li>You have a private room and a shared common area for socializing.</li><li>You have a part-time job on campus to help with the tuition fees.</li></ul>",
            "is_just_description": True,
        },
    ],
    [
        {
            "text": "<h3>Imagine you are a Master Student</h3>",
            "is_just_description": True,
        },
        {
            "text": "<ul><li>You are a new Master's student enrolled in Miskatonic University.</li><li>You come from abroad, and you don't know anyone.</li><li>You live in a shared apartment with the other three tenants.</li><li>In this semester you have lessons 4 days a week, all starting at 9 am.</li><li>After lectures, you like to study in the public spaces of the campus.</li></ul>",
            "is_just_description": True,
        },
    ],
    [
        {
            "text": "<h3>Imagine you are a PhD Student</h3>",
            "is_just_description": True,
        },
        {
            "text": "<ul><li>You are a PhD student just enrolled in the graduate program of Miskatonic University.</li><li>You have weekly meetings with your supervisor and with the other PhD candidates.</li><li>While the university provided you with a working laptop, you still need to access some facilities on campus to carry out your work (e.g., using laboratory equipment).</li></ul>",
            "is_just_description": True,
        },
    ],
    [
        {
            "text": "<h3>Imagine you are a Researcher</h3>",
            "is_just_description": True,
        },
        {
            "text": "<ul><li>You are a researcher working at Miskatonic University.</li><li>Your duties mainly include conducting research, meeting with colleagues, and doing small teaching activities, such as coaching students.</li><li>You don't require any specific facility to carry out your work, but you do like the desk, chair, and monitor provided by the university (and the free coffee).</li></ul>",
            "is_just_description": True,
        },
    ],
    [
        {
            "text": "<h3>Imagine you are a Professor</h3>",
            "is_just_description": True,
        },
        {
            "text": "<ul><li>You are a professor working at Miskatonic University.</li><li>Your duties on campus include attending meetings with both colleagues and students, teaching courses, and conducting research.</li><li>During the past year, you learned how to use several software tools to carry out your work in a remote setting.</li></ul>",
            "is_just_description": True,
        },
    ],
]

view_array_reminder = deepcopy(view_array)
for i in range(len(view_array_reminder)):
    view_array_reminder[i][0]["text"] = view_array_reminder[i][0]["text"].replace("Imagine", "Remember")

opinion_after = [
    {"text": opinion_1_txt + " <span><b>(13 people vote for this option)</b></span>"},
    {"text": opinion_2_txt + " <span><b>(11 people vote for this option)</b></span>"},
    {"text": opinion_3_txt + " <span><b>(16 people vote for this option)</b></span>"},
    {"text": opinion_4_txt + " <span><b>(14 people vote for this option)</b></span>"},
    {"text": opinion_5_txt + " <span><b>(10 people vote for this option)</b></span>"},
]

for i in range(len(opinion_after)):
    opinion_after[i]["value"] = i

select_prompt_txt = "<b class='custom-text-danger'>You may select none, single, or multiple ones.</b>"

motivation_header = [
    {
        "text": "<h2>Check Other People's Motivations</h2>",
        "is_just_description": True,
    },
    {
        "text": "<p class='text'><b class='custom-text-danger'>Please DO NOT go back to the previous page to make changes.</b></p>",
        "is_just_description": True,
    },
    {
        "text": "This page shows a part of the motivations (randomly selected) that other people provided to support their opinions. Please take a look at them and choose the ones that make you <b>understand</b> or <b>resonate</b> with their point of view.",
        "is_just_description": True,
    },
]

rethink = [
    {
        "text": "<h2>Rethink about Your Opinion</h2>",
        "is_just_description": True,
    },
    {
        "text": "<h3>After looking at other people's motivations for choosing opinions, please select your opinion again. As a reminder, below is the scenario.</h3>",
        "is_just_description": True,
    },
    {
        "text": scenario_txt,
        "is_just_description": True,
    },
    {
        "text": "Now that you have looked at other people's motivations. Based on your assigned role, what is your opinion on the scenario?",
        "choices": opinion_after,
    },
]

motivations_meme = [
    {
        "text": "<h3>" + opinion_1_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "Home is the best place",
                    "unsplash_creator_url": "https://unsplash.com/@chuklanov",
                    "unsplash_creator_name": "Avel Chuklanov",
                    "unsplash_image_id": "DUmFLtMeAbQ",
                },
                "value": 1,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1612831455359-970e23a1e4e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1450&q=80",
                    "description": "Stay home, stay safe!",
                    "unsplash_creator_url": "https://unsplash.com/@surface",
                    "unsplash_creator_name": "Surface",
                    "unsplash_image_id": "HJgaV1qjHS0",
                },
                "value": 2,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1492138786289-d35ea832da43?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80",
                    "description": "I prefer working from home and not getting infected",
                    "unsplash_creator_url": "https://unsplash.com/@grovemade",
                    "unsplash_creator_name": "Grovemade",
                    "unsplash_image_id": "RvPDe41lYBA",
                },
                "value": 3,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1637580690960-02f4673ba4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
                    "description": "Remote study for a better study.",
                    "unsplash_creator_url": "https://unsplash.com/@standsome",
                    "unsplash_creator_name": "Standsome Worklifestyle",
                    "unsplash_image_id": "_jw7pZVwFrg",
                },
                "value": 4,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1589463577184-f79043388163?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                    "description": "Safety first!",
                    "unsplash_creator_url": "https://unsplash.com/@hariknight",
                    "unsplash_creator_name": "Hari Menon",
                    "unsplash_image_id": "7xmmnBTOATY",
                },
                "value": 5,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1622295024745-079082431f1a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80",
                    "description": "We've done this for the past 2 years, people are doing just fine.",
                    "unsplash_creator_url": "https://unsplash.com/@emmages",
                    "unsplash_creator_name": "Emmanuel Ikwuegbu",
                    "unsplash_image_id": "HF-WpYPeqZU",
                },
                "value": 6,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1566844100977-86816d92f85f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80",
                    "description": "This is not the time to interact with other people",
                    "unsplash_creator_url": "https://unsplash.com/@kmaimg",
                    "unsplash_creator_name": "KMA .img",
                    "unsplash_image_id": "DBiExzhMt3E",
                },
                "value": 7,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1621294710656-78af659694ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "We shouldn't have lifted restrictions. This little maneuver's gonna cost us 51 years.",
                    "unsplash_creator_url": "https://unsplash.com/@dollargill",
                    "unsplash_creator_name": "Dollar Gill",
                    "unsplash_image_id": "R-EYaqOjhlo",
                },
                "value": 8,
            },
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_2_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1610703415552-d7fca41a8857?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80",
                    "description": "Enough with the social distancing",
                    "unsplash_creator_url": "https://unsplash.com/@maximeutopix",
                    "unsplash_creator_name": "Maxime",
                    "unsplash_image_id": "GsuoClhxMDE",
                },
                "value": 1,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1629128625414-374a9e16d56a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "It's the only way",
                    "unsplash_creator_url": "https://unsplash.com/@sentidoshumanos",
                    "unsplash_creator_name": "sentidos humanos",
                    "unsplash_image_id": "IPe4SIIKuno",
                },
                "value": 2,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1603357465999-241beecc2629?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1864&q=80",
                    "description": "Vaccines and masks for a safe education.",
                    "unsplash_creator_url": "https://unsplash.com/@cherrydeck",
                    "unsplash_creator_name": "Cherrydeck",
                    "unsplash_image_id": "A44EW3n2PgM",
                },
                "value": 3,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1638771105695-8b57e47be23a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "Is this... Irresponsiblity?",
                    "unsplash_creator_url": "https://unsplash.com/@djpaine",
                    "unsplash_creator_name": "DJ Paine",
                    "unsplash_image_id": "_mmronFYaMg",
                },
                "value": 4,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1608326389386-0305acbe600f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=910&q=80",
                    "description": "I believe in the science of the vaccine to protect us",
                    "unsplash_creator_url": "https://unsplash.com/@hakannural",
                    "unsplash_creator_name": "Hakan Nural",
                    "unsplash_image_id": "YCVUR2JgfHA",
                },
                "value": 5,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1543933441-40fbd6b34481?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1478&q=80",
                    "description": "You get out and you get out! No-Vax get out!",
                    "unsplash_creator_url": "https://unsplash.com/@lazycreekimages",
                    "unsplash_creator_name": "Michael Dziedzic",
                    "unsplash_image_id": "B1RsVgAoODU",
                },
                "value": 6,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1704&q=80",
                    "description": "Investing for a better future!",
                    "unsplash_creator_url": "https://unsplash.com/@anikolleshi",
                    "unsplash_creator_name": "Ani Kolleshi",
                    "unsplash_image_id": "7jjnJ-QA9fY",
                },
                "value": 7,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1587316745621-3757c7076f7b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1546&q=80",
                    "description": "Vaccination is the way to get all of us out from lockdown",
                    "unsplash_creator_url": "https://unsplash.com/@mattseymour",
                    "unsplash_creator_name": "Matt Seymour",
                    "unsplash_image_id": "69zVsGRejY4",
                },
                "value": 8,
            },
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_3_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1597914377769-db5167cb0221?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
                    "description": "Balanced as everything should be.",
                    "unsplash_creator_url": "https://unsplash.com/@justusmenke",
                    "unsplash_creator_name": "Justus Menke",
                    "unsplash_image_id": "YGBYROFge3c",
                },
                "value": 1,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1506485338023-6ce5f36692df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "Safety, Happiness, simply Schedule.",
                    "unsplash_creator_url": "https://unsplash.com/@jazminantoinette",
                    "unsplash_creator_name": "Jazmin Quaynor",
                    "unsplash_image_id": "18mUXUS8ksI",
                },
                "value": 2,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1584697964328-b1e7f63dca95?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "Sometimes I just want to stay home and not go to campus for education",
                    "unsplash_creator_url": "https://unsplash.com/@anniespratt",
                    "unsplash_creator_name": "Annie Spratt",
                    "unsplash_image_id": "xKJUnFwfz3s",
                },
                "value": 3,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1639255107090-55e2163e80bb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
                    "description": "We have computers in our pockets, c'mon!",
                    "unsplash_creator_url": "https://unsplash.com/@santesson89",
                    "unsplash_creator_name": "Andrea De Santis",
                    "unsplash_image_id": "_PoOFXAMy24",
                },
                "value": 4,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1519172380095-d03587980a44?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2022&q=80",
                    "description": "Freedom of choice",
                    "unsplash_creator_url": "https://unsplash.com/@dillonjshook",
                    "unsplash_creator_name": "Dillon Shook",
                    "unsplash_image_id": "3iPKIXVXv_U",
                },
                "value": 5,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1611175697352-c8a3d5719783?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
                    "description": "I want to work with my colleagues safely on campus with masks",
                    "unsplash_creator_url": "https://unsplash.com/@sigmund",
                    "unsplash_creator_name": "Sigmund",
                    "unsplash_image_id": "LyF5jsdcYW0",
                },
                "value": 6,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2874&q=80",
                    "description": "Better than only ZOOM",
                    "unsplash_creator_url": "https://unsplash.com/@cwmonty",
                    "unsplash_creator_name": "Chris Montgomery",
                    "unsplash_image_id": "smgTvepind4",
                },
                "value": 7,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1518152006812-edab29b069ac?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "One does not simply have a lab in their living room.",
                    "unsplash_creator_url": "https://unsplash.com/@cheaousa",
                    "unsplash_creator_name": "Ousa Chea",
                    "unsplash_image_id": "gKUC4TMhOiY",
                },
                "value": 8,
            },
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_4_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2952&q=80",
                    "description": "Still better than nothing.",
                    "unsplash_creator_url": "https://unsplash.com/@taypaigey",
                    "unsplash_creator_name": "Taylor Wilcox",
                    "unsplash_image_id": "4nKOEAQaTgA",
                },
                "value": 1,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "I love asking questions",
                    "unsplash_creator_url": "https://unsplash.com/@iamfelicia",
                    "unsplash_creator_name": "Felicia Buitenwerf",
                    "unsplash_image_id": "Qs_Zkak27Jk",
                },
                "value": 2,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1599999904650-eec3c4311622?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80",
                    "description": "I do not want to learn alone at home (sad)",
                    "unsplash_creator_url": "https://unsplash.com/@sammoqadam",
                    "unsplash_creator_name": "Sam Moqadam",
                    "unsplash_image_id": "gH5yrgiw4Xw",
                },
                "value": 3,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1784&q=80",
                    "description": "Less teamwork = Worse performances.",
                    "unsplash_creator_url": "https://unsplash.com/@anniespratt",
                    "unsplash_creator_name": "Annie Spratt",
                    "unsplash_image_id": "hCb3lIB8L8E",
                },
                "value": 4,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1592303637753-ce1e6b8a0ffb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80",
                    "description": "I miss my colleagues",
                    "unsplash_creator_url": "https://unsplash.com/@cxinsight",
                    "unsplash_creator_name": "CX Insight",
                    "unsplash_image_id": "YloghyfD7e8",
                },
                "value": 5,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "I miss both in-person education and social activities, but we should open things one at a time",
                    "unsplash_creator_url": "https://unsplash.com/@anniespratt",
                    "unsplash_creator_name": "Annie Spratt",
                    "unsplash_image_id": "QckxruozjRg",
                },
                "value": 6,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80",
                    "description": "Ight imma head to class.",
                    "unsplash_creator_url": "https://unsplash.com/@domlafou",
                    "unsplash_creator_name": "Dom Fou",
                    "unsplash_image_id": "YRMWVcdyhmI",
                },
                "value": 7,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1594788094620-4579ad50c7fe?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80",
                    "description": "We should avoid useless gatherings.",
                    "unsplash_creator_url": "https://unsplash.com/@mohammadshahhosseini",
                    "unsplash_creator_name": "Mohammad Shahhosseini",
                    "unsplash_image_id": "cPWUODAvXjk",
                },
                "value": 8,
            },
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_5_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1577985043696-8bd54d9f093f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "A university is more than just lectures",
                    "unsplash_creator_url": "https://unsplash.com/@adrienolichon",
                    "unsplash_creator_name": "Adrien Olichon",
                    "unsplash_image_id": "z8XO8BfqpYc",
                },
                "value": 1,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1613946069412-38f7f1ff0b65?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                    "description": "Campus life is an important part of a university.",
                    "unsplash_creator_url": "https://unsplash.com/@simonkaremann",
                    "unsplash_creator_name": "Simon Karemann",
                    "unsplash_image_id": "p85-MG66GRY",
                },
                "value": 2,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1477238134895-98438ad85c30?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2600&q=80",
                    "description": "Finally a quiet place",
                    "unsplash_creator_url": "https://unsplash.com/@cant89",
                    "unsplash_creator_name": "Davide Cantelli",
                    "unsplash_image_id": "e3Uy4k7ooYk",
                },
                "value": 3,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1629036747901-6cad3758cd92?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=772&q=80",
                    "description": "People know how to behave.",
                    "unsplash_creator_url": "https://unsplash.com/@zhugher",
                    "unsplash_creator_name": "he zhu",
                    "unsplash_image_id": "FN7pEVoDphc",
                },
                "value": 4,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1558023784-f8343393cb06?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
                    "description": "Enjoy your life!",
                    "unsplash_creator_url": "https://unsplash.com/@frankielopez",
                    "unsplash_creator_name": "Frankie Lopez",
                    "unsplash_image_id": "jI3PmZZscBs",
                },
                "value": 5,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
                    "description": "Life is too short, let's go drinking!!!",
                    "unsplash_creator_url": "https://unsplash.com/@priscilladupreez",
                    "unsplash_creator_name": "Priscilla Du Preez",
                    "unsplash_image_id": "W3SEyZODn8U",
                },
                "value": 6,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1590727264967-f26b2d31e3a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=792&q=80",
                    "description": "I hate lockdown when nothing is open",
                    "unsplash_creator_url": "https://unsplash.com/@markusspiske",
                    "unsplash_creator_name": "Markus Spiske",
                    "unsplash_image_id": "DGoWFMB1LM0",
                },
                "value": 7,
            },
            {
                "text": {
                    "url": "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1820&q=80",
                    "description": "Back to a real life!",
                    "unsplash_creator_url": "https://unsplash.com/@heftiba",
                    "unsplash_creator_name": "Toa Heftiba",
                    "unsplash_image_id": "6bKpHAun4d8",
                },
                "value": 8,
            },
        ],
        "is_mulitple_choice": True,
    },
]

motivations_text_only = [
    {
        "text": "<h3>" + opinion_1_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {"text": {"description": "Home is the best place"}, "value": 1},
            {"text": {"description": "Stay home, stay safe!"}, "value": 2},
            {"text": {"description": "I prefer working from home and not getting infected"}, "value": 3},
            {"text": {"description": "Remote study for a better study."}, "value": 4},
            {"text": {"description": "Safety first!"}, "value": 5},
            {"text": {"description": "We've done this for the past 2 years, people are doing just fine."}, "value": 6},
            {"text": {"description": "This is not the time to interact with other people"}, "value": 7},
            {"text": {"description": "We shouldn't have lifted restrictions. This little maneuver's gonna cost us 51 years."}, "value": 8},
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_2_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {"text": {"description": "Enough with the social distancing"}, "value": 1},
            {"text": {"description": "It's the only way"}, "value": 2},
            {"text": {"description": "Vaccines and masks for a safe education."}, "value": 3},
            {"text": {"description": "Is this... Irresponsiblity?"}, "value": 4},
            {"text": {"description": "I believe in the science of the vaccine to protect us"}, "value": 5},
            {"text": {"description": "You get out and you get out! No-Vax get out!"}, "value": 6},
            {"text": {"description": "Investing for a better future!"}, "value": 7},
            {"text": {"description": "Vaccination is the way to get all of us out from lockdown"}, "value": 8},
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_3_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {"text": {"description": "Balanced as everything should be."}, "value": 1},
            {"text": {"description": "Safety, Happiness, simply Schedule."}, "value": 2},
            {"text": {"description": "Sometimes I just want to stay home and not go to campus for education"}, "value": 3},
            {"text": {"description": "We have computers in our pockets, c'mon!"}, "value": 4},
            {"text": {"description": "Freedom of choice"}, "value": 5},
            {"text": {"description": "I want to work with my colleagues safely on campus with masks"}, "value": 6},
            {"text": {"description": "Better than only ZOOM"}, "value": 7},
            {"text": {"description": "One does not simply have a lab in their living room."}, "value": 8},
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_4_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {"text": {"description": "Still better than nothing."}, "value": 1},
            {"text": {"description": "I love asking questions"}, "value": 2},
            {"text": {"description": "I do not want to learn alone at home (sad)"}, "value": 3},
            {"text": {"description": "Less teamwork = Worse performances."}, "value": 4},
            {"text": {"description": "I miss my colleagues"}, "value": 5},
            {"text": {"description": "I miss both in-person education and social activities, but we should open things one at a time"}, "value": 6},
            {"text": {"description": "Ight imma head to class."}, "value": 7},
            {"text": {"description": "We should avoid useless gatherings."}, "value": 8},
        ],
        "is_mulitple_choice": True,
    },
    {
        "text": "<h3>" + opinion_5_txt + "</h3>" + select_prompt_txt,
        "choices": [
            {"text": {"description": "A university is more than just lectures"}, "value": 1},
            {"text": {"description": "Campus life is an important part of a university."}, "value": 2},
            {"text": {"description": "Finally a quiet place"}, "value": 3},
            {"text": {"description": "People know how to behave."}, "value": 4},
            {"text": {"description": "Enjoy your life!"}, "value": 5},
            {"text": {"description": "Life is too short, let's go drinking!!!"}, "value": 6},
            {"text": {"description": "I hate lockdown when nothing is open"}, "value": 7},
            {"text": {"description": "Back to a real life!"}, "value": 8},
        ],
        "is_mulitple_choice": True,
    },
]

rethink_no_scenario_txt = [
    {
        "text": "<h2>Rethink about Your Opinion</h2>",
        "is_just_description": True,
    },
    {
        "text": "<p class='text'><b class='custom-text-danger'>Please DO NOT go back to the previous page to make changes.</b></p>",
        "is_just_description": True,
    },
    {
        "text": "<h3>The question on this page shows other people's votes. Please take a look at them and select your opinion again.</h3>",
        "is_just_description": True,
    },
    {
        "text": "What is your opinion on the scenario, based on your assigned role, and after you take a look at other people's votes?",
        "choices": opinion_after,
    },
]

reflection_head = [
    {
        "text": "<h2>Reflection Questionnaire</h2>",
        "is_just_description": True,
    },
    {
        "text": "Please answer the following questions regarding the previous step of rethinking your opinion.",
        "is_just_description": True,
    },
]

reflection_vote = [
    {
        "text": "Seeing other people's <b>votes</b> plays an important role in my decision.",
        "choices": likert_scale_5,
    }
]

reflection_motivation = [
    {
        "text": "Seeing other people's <b>motivations</b> plays an important role in my decision.",
        "choices": likert_scale_5,
    }
]

reflection_image = [
    {
        "text": "Seeing <b>images</b> in other people's motivations plays an important role in my decision.",
        "choices": likert_scale_5,
    }
]

satisfaction = [
    {
        "text": "<h2>Satisfaction Questionnaire</h2>",
        "is_just_description": True,
    },
    {
        "text": "Please answer the following questions regarding the usability and experience of this tool.",
        "is_just_description": True,
    },
    {
        "text": "The tool has been easy to use.",
        "choices": likert_scale_5,
    },
    {
        "text": "Have you used similar digital tools before?",
        "choices": [{"text": "Yes", "value": 1}, {"text": "No", "value": 2}],
    },
    {
        "text": "Do you have any comments for this study (e.g., problems in using the digital tool)?",
    },
]


def add_field(array_of_dict, field_name, field_value):
    cp = deepcopy(array_of_dict)
    for i in range(len(cp)):
        cp[i][field_name] = field_value
    return cp


def add_field_increase(array_of_dict, field_name, field_value_init):
    cp = deepcopy(array_of_dict)
    for i in range(len(cp)):
        cp[i][field_name] = field_value_init + i
    return cp


####################
# General pages

page_array = []

page_0 = study_head + empathy_questions
page_0 = add_field(page_0, "page", 0)
page_array.append(page_0)

page_1 = demographic_questions
page_1 = add_field(page_1, "page", 1)
page_array.append(page_1)

page_2 = []
page_2_views = []
for k in range(len(view_array)):
    page_2_views.append(scenario + view_array[k] + opinion_before)

for i in range(len(page_2_views)):
    page_2 += add_field(page_2_views[i], "view", i)
page_array.append(add_field(page_2, "page", 2))

##########################
# Mode 1 specific pages

mode_1_pages = []

for j in range(len(motivations_meme)):
    mode_1_page_n = []
    mode_1_page_n_views = []
    for k in range(len(view_array_reminder)):
        mode_1_page_n_views.append(motivation_header + view_array_reminder[k] + [motivations_meme[j]])
    for i in range(len(mode_1_page_n_views)):
        mode_1_page_n += add_field(mode_1_page_n_views[i], "view", i)
    mode_1_pages.append(mode_1_page_n)

mode_1_pages.append(rethink)
mode_1_pages.append(reflection_head + reflection_vote + reflection_motivation + reflection_image)
mode_1_pages.append(satisfaction)

for i in range(len(mode_1_pages)):
    mode_1_pages[i] = add_field(mode_1_pages[i], "page", 3 + i)
    mode_1_pages[i] = add_field(mode_1_pages[i], "mode", 1)

page_array += mode_1_pages

##########################
# Mode 2 specific pages

mode_2_pages = []

for j in range(len(motivations_text_only)):
    mode_2_page_n = []
    mode_2_page_n_views = []
    for k in range(len(view_array_reminder)):
        mode_2_page_n_views.append(motivation_header + view_array_reminder[k] + [motivations_text_only[j]])
    for i in range(len(mode_2_page_n_views)):
        mode_2_page_n += add_field(mode_2_page_n_views[i], "view", i)
    mode_2_pages.append(mode_2_page_n)

mode_2_pages.append(rethink)
mode_2_pages.append(reflection_head + reflection_vote + reflection_motivation)
mode_2_pages.append(satisfaction)

for i in range(len(mode_2_pages)):
    mode_2_pages[i] = add_field(mode_2_pages[i], "page", 3 + i)
    mode_2_pages[i] = add_field(mode_2_pages[i], "mode", 2)

page_array += mode_2_pages

##########################
# Mode 3 specific pages

mode_3_pages = []
mode_3_pages.append(rethink_no_scenario_txt)
mode_3_pages.append(reflection_head + reflection_vote)
mode_3_pages.append(satisfaction)
for i in range(len(mode_3_pages)):
    mode_3_pages[i] = add_field(mode_3_pages[i], "page", 3 + i)
    mode_3_pages[i] = add_field(mode_3_pages[i], "mode", 3)
page_array += mode_3_pages

#################
# Merge pages

data = []
for p in page_array:
    data += p
data = add_field_increase(data, "order", 0)

with open("scenario_question_2_1.json", "w") as outfile:
    json.dump(data, outfile)
