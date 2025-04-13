/* english_plural.js - Fully enhanced with singular word display and results page update */

// Paste your manually provided JSON data here.
const quizData = [
  [
  {
    "noun": "cat",
    "options": ["cats", "cates", "caties", "catys"],
    "answer": "cats",
    "explanation": "We add an 's' at the end to show more than one cat."
  },
  {
    "noun": "dog",
    "options": ["dogs", "doges", "dogies", "dogys"],
    "answer": "dogs",
    "explanation": "Just put an 's' on the end to show there are many dogs."
  },
  {
    "noun": "fish",
    "options": ["fish", "fishes", "fishies", "fishos"],
    "answer": "fish",
    "explanation": "For fish, the word stays the same when there is more than one."
  },
  {
    "noun": "bird",
    "options": ["birds", "birdes", "birdis", "birdys"],
    "answer": "birds",
    "explanation": "We add an 's' to tell us there are many birds."
  },
  {
    "noun": "apple",
    "options": ["apples", "applas", "applese", "appals"],
    "answer": "apples",
    "explanation": "Simply add an 's' when you have more than one apple."
  },
  {
    "noun": "box",
    "options": ["boxs", "boxes", "boxies", "boxos"],
    "answer": "boxes",
    "explanation": "When a word ends with x, we add 'es' to make it more than one."
  },
  {
    "noun": "bus",
    "options": ["busses", "busis", "busos", "buses"],
    "answer": "buses",
    "explanation": "For the bus, we add 'es' because it ends in s."
  },
  {
    "noun": "baby",
    "options": ["babys", "babies", "babyes", "babiees"],
    "answer": "babies",
    "explanation": "Change the 'y' to 'ies' when there are more than one baby."
  },
  {
    "noun": "city",
    "options": ["citys", "cities", "cityes", "cityies"],
    "answer": "cities",
    "explanation": "We change 'y' to 'ies' because city ends with 'y' after a consonant."
  },
  {
    "noun": "monkey",
    "options": ["monkeys", "monkiees", "monkies", "monkys"],
    "answer": "monkeys",
    "explanation": "Here we simply add an 's' since 'monkey' ends in a vowel and then y."
  },
  {
    "noun": "chair",
    "options": ["chairs", "chairies", "chairas", "chaires"],
    "answer": "chairs",
    "explanation": "Add an 's' to show there are more chairs."
  },
  {
    "noun": "table",
    "options": ["tables", "tablues", "tablis", "tablos"],
    "answer": "tables",
    "explanation": "Just add an 's' at the end to make it plural."
  },
  {
    "noun": "toy",
    "options": ["toys", "toyies", "toyos", "toies"],
    "answer": "toys",
    "explanation": "Since toy ends with 'y' after a vowel, we just add 's'."
  },
  {
    "noun": "story",
    "options": ["storys", "storis", "storyies", "stories"],
    "answer": "stories",
    "explanation": "For story, change 'y' to 'ies' to show more than one."
  },
  {
    "noun": "bush",
    "options": ["bushs", "bushes", "bushies", "bushos"],
    "answer": "bushes",
    "explanation": "When a word ends with sh, we add 'es' for the plural."
  },
  {
    "noun": "sandwich",
    "options": ["sandwichs", "sandwiches", "sandwichees", "sandwitches"],
    "answer": "sandwiches",
    "explanation": "We add 'es' because sandwich ends with ch."
  },
  {
    "noun": "brush",
    "options": ["brushs", "brushes", "brushies", "brushos"],
    "answer": "brushes",
    "explanation": "Add 'es' for words that end in sh."
  },
  {
    "noun": "dish",
    "options": ["dishs", "dishes", "dishies", "dishos"],
    "answer": "dishes",
    "explanation": "When a word ends in sh, we add 'es' to the end."
  },
  {
    "noun": "fox",
    "options": ["foxs", "foxes", "foxies", "foxos"],
    "answer": "foxes",
    "explanation": "The word fox becomes foxes by adding 'es'."
  },
  {
    "noun": "quiz",
    "options": ["quizs", "quizes", "quizies", "quizzes"],
    "answer": "quizzes",
    "explanation": "We add 'zes' because quiz ends with a z sound."
  },
  {
    "noun": "potato",
    "options": ["potatos", "potatoes", "potatoes", "potatios"],
    "answer": "potatoes",
    "explanation": "For potato, we add 'es' to make it plural."
  },
  {
    "noun": "tomato",
    "options": ["tomatos", "tomatoes", "tomatios", "tomatoes"],
    "answer": "tomatoes",
    "explanation": "We add 'es' because tomato ends with o."
  },
  {
    "noun": "hero",
    "options": ["heros", "heroes", "herois", "heroos"],
    "answer": "heroes",
    "explanation": "Since hero ends with o after a consonant, we add 'es'."
  },
  {
    "noun": "echo",
    "options": ["echos", "echoes", "echois", "echoos"],
    "answer": "echoes",
    "explanation": "Add 'es' because echo ends in o after a consonant sound."
  },
  {
    "noun": "mosquito",
    "options": ["mosquitos", "mosquitoes", "mosquitios", "mosquitees"],
    "answer": "mosquitoes",
    "explanation": "We add 'es' to mosquito to show there are many."
  },
  {
    "noun": "child",
    "options": ["childs", "childes", "childies", "children"],
    "answer": "children",
    "explanation": "Child changes to 'children' when there is more than one."
  },
  {
    "noun": "man",
    "options": ["mans", "manes", "manis", "men"],
    "answer": "men",
    "explanation": "Man becomes 'men' to show many grown-up boys."
  },
  {
    "noun": "woman",
    "options": ["womans", "women", "womans", "womien"],
    "answer": "women",
    "explanation": "Woman changes to 'women' when there is more than one."
  },
  {
    "noun": "tooth",
    "options": ["tooths", "toothees", "toothies", "teeth"],
    "answer": "teeth",
    "explanation": "Tooth becomes 'teeth' because it’s a special change."
  },
  {
    "noun": "foot",
    "options": ["foots", "footes", "footies", "feet"],
    "answer": "feet",
    "explanation": "Foot changes to 'feet' when there are many."
  },
  {
    "noun": "mouse",
    "options": ["mouses", "mousees", "mouseis", "mice"],
    "answer": "mice",
    "explanation": "Mouse becomes 'mice' in a funny, special way."
  },
  {
    "noun": "deer",
    "options": ["deers", "deeres", "deeris", "deer"],
    "answer": "deer",
    "explanation": "Deer stays the same when there is more than one."
  },
  {
    "noun": "sheep",
    "options": ["sheeps", "sheepees", "sheepies", "sheep"],
    "answer": "sheep",
    "explanation": "Sheep stays as 'sheep' even when there are many."
  },
  {
    "noun": "crab",
    "options": ["crabs", "crabes", "crabies", "crabos"],
    "answer": "crabs",
    "explanation": "Just add an 's' to show there are lots of crabs."
  },
  {
    "noun": "snail",
    "options": ["snails", "snalees", "snailis", "snailos"],
    "answer": "snails",
    "explanation": "We add 's' because there is more than one snail."
  },
  {
    "noun": "frog",
    "options": ["frogs", "froggies", "frogis", "frogos"],
    "answer": "frogs",
    "explanation": "Add an 's' when you have lots of frogs."
  },
  {
    "noun": "bug",
    "options": ["bugs", "bugies", "bugis", "bugos"],
    "answer": "bugs",
    "explanation": "Just add 's' to show there are many bugs."
  },
  {
    "noun": "tree",
    "options": ["trees", "treees", "treis", "treeos"],
    "answer": "trees",
    "explanation": "We add an 's' because there are many trees."
  },
  {
    "noun": "flower",
    "options": ["flowers", "flowres", "floweries", "flouers"],
    "answer": "flowers",
    "explanation": "Just add 's' to make more than one flower."
  },
  {
    "noun": "cloud",
    "options": ["clouds", "cloudes", "cloudies", "cloudoes"],
    "answer": "clouds",
    "explanation": "We add an 's' at the end to show many clouds."
  },
  {
    "noun": "star",
    "options": ["stars", "stares", "staries", "staros"],
    "answer": "stars",
    "explanation": "Add an 's' to show a bunch of stars."
  },
  {
    "noun": "sun",
    "options": ["suns", "sunes", "sunies", "sunos"],
    "answer": "suns",
    "explanation": "Even though there is one sun for us, in other cases we add 's'."
  },
  {
    "noun": "moon",
    "options": ["moons", "moones", "moonies", "moonos"],
    "answer": "moons",
    "explanation": "We add 's' because there can be many moons in stories."
  },
  {
    "noun": "car",
    "options": ["cars", "caris", "carees", "caros"],
    "answer": "cars",
    "explanation": "Add an 's' when you have more than one car."
  },
  {
    "noun": "train",
    "options": ["trains", "traines", "trainies", "trainos"],
    "answer": "trains",
    "explanation": "We add an 's' to show there are many trains."
  },
  {
    "noun": "plane",
    "options": ["planes", "planees", "planis", "planos"],
    "answer": "planes",
    "explanation": "Just add an 's' to make the word plural."
  },
  {
    "noun": "boat",
    "options": ["boats", "boates", "boatis", "boatos"],
    "answer": "boats",
    "explanation": "Add an 's' at the end because there are many boats."
  },
  {
    "noun": "ship",
    "options": ["ships", "shipes", "shipis", "shipos"],
    "answer": "ships",
    "explanation": "We add an 's' since more than one ship is sailing."
  },
  {
    "noun": "house",
    "options": ["houses", "housees", "houseis", "houseos"],
    "answer": "houses",
    "explanation": "Simply add an 's' to show more than one house."
  },
  {
    "noun": "window",
    "options": ["windows", "windowes", "windowis", "windowos"],
    "answer": "windows",
    "explanation": "Add an 's' because there are many windows."
  },
  {
    "noun": "door",
    "options": ["doors", "doores", "dooris", "dooros"],
    "answer": "doors",
    "explanation": "Just put an 's' at the end for more than one door."
  },
  {
    "noun": "ball",
    "options": ["balls", "balles", "ballis", "ballos"],
    "answer": "balls",
    "explanation": "We add 's' to show that there are many balls."
  },
  {
    "noun": "doll",
    "options": ["dolls", "dolles", "dollis", "dollos"],
    "answer": "dolls",
    "explanation": "Just add an 's' to make it plural."
  },
  {
    "noun": "pen",
    "options": ["pens", "penes", "penis", "penos"],
    "answer": "pens",
    "explanation": "Add an 's' because there are many pens."
  },
  {
    "noun": "pencil",
    "options": ["pencils", "penciles", "pencils", "pencelos"],
    "answer": "pencils",
    "explanation": "Simply add an 's' to show more than one pencil."
  },
  {
    "noun": "book",
    "options": ["books", "bookes", "bookis", "bookos"],
    "answer": "books",
    "explanation": "We add 's' to show there are many books to read."
  },
  {
    "noun": "paper",
    "options": ["papers", "papres", "paperis", "paperos"],
    "answer": "papers",
    "explanation": "Just add an 's' at the end for more than one paper."
  },
  {
    "noun": "computer",
    "options": ["computers", "computeres", "computeris", "computeros"],
    "answer": "computers",
    "explanation": "We add an 's' to show there are many computers."
  },
  {
    "noun": "phone",
    "options": ["phones", "phonees", "phoneis", "phoneos"],
    "answer": "phones",
    "explanation": "Simply add 's' when there is more than one phone."
  },
  {
    "noun": "video",
    "options": ["videos", "videoes", "videois", "videoos"],
    "answer": "videos",
    "explanation": "Add an 's' to show that there are many videos."
  },
  {
    "noun": "camera",
    "options": ["cameras", "cameraes", "camerais", "cameraos"],
    "answer": "cameras",
    "explanation": "We add 's' because there are many cameras."
  },
  {
    "noun": "robot",
    "options": ["robots", "robotes", "robotis", "robotos"],
    "answer": "robots",
    "explanation": "Just add an 's' when you have more than one robot."
  },
  {
    "noun": "cake",
    "options": ["cakes", "cakees", "cakeis", "cakeos"],
    "answer": "cakes",
    "explanation": "Add an 's' to make it plural because there are many cakes."
  },
  {
    "noun": "pie",
    "options": ["pies", "piees", "pieis", "pieos"],
    "answer": "pies",
    "explanation": "We add an 's' since more than one pie is yummy."
  },
  {
    "noun": "cookie",
    "options": ["cookies", "cookiees", "cookieis", "cookieos"],
    "answer": "cookies",
    "explanation": "Just add an 's' because cookies are for sharing."
  },
  {
    "noun": "egg",
    "options": ["eggs", "eggies", "egges", "eggos"],
    "answer": "eggs",
    "explanation": "Add an 's' to show there are many eggs."
  },
  {
    "noun": "orange",
    "options": ["oranges", "orangees", "orangeis", "orangeos"],
    "answer": "oranges",
    "explanation": "Simply add an 's' to show more than one orange."
  },
  {
    "noun": "banana",
    "options": ["bananas", "bananaes", "bananais", "bananaos"],
    "answer": "bananas",
    "explanation": "We add an 's' to show there are many bananas."
  },
  {
    "noun": "grape",
    "options": ["grapes", "grapees", "grapeis", "grapeos"],
    "answer": "grapes",
    "explanation": "Add an 's' because there are lots of grapes."
  },
  {
    "noun": "strawberry",
    "options": ["strawberrys", "strawberries", "strawberries", "strawbery"],
    "answer": "strawberries",
    "explanation": "Change 'y' to 'ies' to make more than one strawberry."
  },
  {
    "noun": "carrot",
    "options": ["carrots", "carrotes", "carrotis", "carrotos"],
    "answer": "carrots",
    "explanation": "Simply add an 's' to show there are many carrots."
  },
  {
    "noun": "cupcake",
    "options": ["cupcakes", "cupcakees", "cupcakeis", "cupcakeos"],
    "answer": "cupcakes",
    "explanation": "We add an 's' because cupcakes are yummy and more than one."
  },
  {
    "noun": "candy",
    "options": ["candys", "candies", "candyes", "candiis"],
    "answer": "candies",
    "explanation": "Change 'y' to 'ies' when there is more than one candy."
  },
  {
    "noun": "game",
    "options": ["games", "gamees", "gameis", "gameos"],
    "answer": "games",
    "explanation": "Add an 's' to show that there are many games to play."
  },
  {
    "noun": "puzzle",
    "options": ["puzzles", "puzzlees", "puzzleis", "puzzlos"],
    "answer": "puzzles",
    "explanation": "We add an 's' because puzzles come in many pieces."
  },
  {
    "noun": "bike",
    "options": ["bikes", "bikees", "bikeis", "bikeos"],
    "answer": "bikes",
    "explanation": "Simply add an 's' when there is more than one bike."
  },
  {
    "noun": "scooter",
    "options": ["scooters", "scooteres", "scooteris", "scooteros"],
    "answer": "scooters",
    "explanation": "Add an 's' to show there are many scooters."
  },
  {
    "noun": "skateboard",
    "options": ["skateboards", "skateboardes", "skateboardis", "skateboardos"],
    "answer": "skateboards",
    "explanation": "We add an 's' to make it plural when there are many skateboards."
  },
  {
    "noun": "drum",
    "options": ["drums", "drumes", "drumis", "drumos"],
    "answer": "drums",
    "explanation": "Add an 's' because there are many drums to beat."
  },
  {
    "noun": "guitar",
    "options": ["guitars", "guitaros", "guitaries", "guitaris"],
    "answer": "guitars",
    "explanation": "Simply add an 's' to show there are more than one guitar."
  },
  {
    "noun": "piano",
    "options": ["pianos", "pianoes", "pianois", "pianoos"],
    "answer": "pianos",
    "explanation": "We add an 's' because pianos are musical and more than one."
  },
  {
    "noun": "violin",
    "options": ["violins", "violinis", "violines", "violinos"],
    "answer": "violins",
    "explanation": "Just add an 's' to show there are many violins."
  },
  {
    "noun": "lesson",
    "options": ["lessons", "lessonies", "lessones", "lessonis"],
    "answer": "lessons",
    "explanation": "Add an 's' because there are many lessons to learn."
  },
  {
    "noun": "class",
    "options": ["classs", "classes", "classies", "clasis"],
    "answer": "classes",
    "explanation": "Since class ends with ss, we add 'es' to show there are many."
  },
  {
    "noun": "friend",
    "options": ["friends", "friendes", "friendis", "friendos"],
    "answer": "friends",
    "explanation": "Simply add an 's' for more than one friend."
  },
  {
    "noun": "picture",
    "options": ["pictures", "picturees", "pictureis", "pictureos"],
    "answer": "pictures",
    "explanation": "Add an 's' to show there are many pictures to look at."
  },
  {
    "noun": "movie",
    "options": ["movies", "moviees", "movieis", "movieos"],
    "answer": "movies",
    "explanation": "We add an 's' because there are many movies to watch."
  },
  {
    "noun": "song",
    "options": ["songs", "songes", "songis", "songos"],
    "answer": "songs",
    "explanation": "Just add an 's' when you have more than one song."
  },
  {
    "noun": "dance",
    "options": ["dances", "dancees", "danceis", "danceos"],
    "answer": "dances",
    "explanation": "Add an 's' because dances are fun when there are many."
  },
  {
    "noun": "party",
    "options": ["partys", "parties", "partyies", "partyos"],
    "answer": "parties",
    "explanation": "Change 'y' to 'ies' because party ends in y after a consonant."
  },
  {
    "noun": "gift",
    "options": ["gifts", "giftes", "giftis", "giftos"],
    "answer": "gifts",
    "explanation": "Simply add an 's' to show there are many gifts."
  },
  {
    "noun": "balloon",
    "options": ["balloons", "ballonns", "balloonies", "balloonss"],
    "answer": "balloons",
    "explanation": "Add an 's' to show that there are many balloons to play with."
  },
  {
    "noun": "lollipop",
    "options": ["lollipops", "lollipopes", "lollipopis", "lollipopos"],
    "answer": "lollipops",
    "explanation": "We add an 's' because there are many yummy lollipops."
  },
  {
    "noun": "bunny",
    "options": ["bunnys", "bunnies", "bunnyes", "bunnis"],
    "answer": "bunnies",
    "explanation": "Change 'y' to 'ies' because bunny ends with a 'y'."
  },
  {
    "noun": "puppy",
    "options": ["puppys", "puppies", "puppyes", "puppis"],
    "answer": "puppies",
    "explanation": "Change the ending 'y' to 'ies' when there is more than one puppy."
  },
  {
    "noun": "kitten",
    "options": ["kittens", "kittenes", "kittenis", "kittenos"],
    "answer": "kittens",
    "explanation": "Simply add an 's' because kittens is more than one kitten."
  },
  {
    "noun": "muffin",
    "options": ["muffins", "muffines", "muffinis", "muffinos"],
    "answer": "muffins",
    "explanation": "We add an 's' at the end to show there are many muffins."
  },
  {
    "noun": "watch",
    "options": ["watchs", "watches", "watchies", "watchos"],
    "answer": "watches",
    "explanation": "For words ending in 'ch', we add 'es' to make them plural."
  },
  {
    "noun": "match",
    "options": ["matchs", "matchies", "matchets", "matches"],
    "answer": "matches",
    "explanation": "We add 'es' because match ends with 'ch'."
  },
  {
    "noun": "bench",
    "options": ["benchs", "benchies", "benches", "benchos"],
    "answer": "benches",
    "explanation": "Add 'es' since bench ends with 'ch'."
  },
  {
    "noun": "peach",
    "options": ["peachs", "peachies", "peachees", "peaches"],
    "answer": "peaches",
    "explanation": "We change the ending by adding 'es' because peach ends with 'ch'."
  },
  {
    "noun": "lunch",
    "options": ["lunchs", "lunchies", "lunches", "lunchos"],
    "answer": "lunches",
    "explanation": "For lunch, we add 'es' to show there are many lunches."
  },
  {
    "noun": "crutch",
    "options": ["crutchs", "crutchies", "crutches", "crutchos"],
    "answer": "crutches",
    "explanation": "When a word ends with 'ch' and sounds special, we add 'es' and change it to 'crutches'."
  },
  {
    "noun": "branch",
    "options": ["branchs", "branchies", "branches", "branchos"],
    "answer": "branches",
    "explanation": "We add 'es' to branch because it ends with 'ch'."
  },
  {
    "noun": "beach",
    "options": ["beachs", "beachies", "beaches", "beachos"],
    "answer": "beaches",
    "explanation": "Add 'es' since beach ends with 'ch'."
  },
  {
    "noun": "leash",
    "options": ["leashs", "leashes", "leashies", "leashos"],
    "answer": "leashes",
    "explanation": "We add an 'es' because leash ends with 'sh'."
  },
  {
    "noun": "patch",
    "options": ["patchs", "patchies", "patches", "patchos"],
    "answer": "patches",
    "explanation": "Change the ending by adding 'es' since patch ends with 'ch'."
  },
  {
    "noun": "clutch",
    "options": ["clutchs", "clutchies", "clutches", "clutchos"],
    "answer": "clutches",
    "explanation": "For clutch, we add 'es' to form the plural."
  },
  {
    "noun": "splash",
    "options": ["splashs", "splashies", "splashes", "splashos"],
    "answer": "splashes",
    "explanation": "We add 'es' to splash to show there are many splashes."
  },
  {
    "noun": "squash",
    "options": ["squashs", "squashies", "squashes", "squashos"],
    "answer": "squashes",
    "explanation": "Even though squash is also a vegetable, we add 'es' for the plural."
  },
  {
    "noun": "couch",
    "options": ["couchs", "couchies", "couches", "couchos"],
    "answer": "couches",
    "explanation": "Add 'es' because couch ends with 'ch'."
  },
  {
    "noun": "hutch",
    "options": ["hutchs", "hutchies", "hutches", "hutchos"],
    "answer": "hutches",
    "explanation": "We add 'es' to hutch since it ends with 'ch'."
  },
  {
    "noun": "stitch",
    "options": ["stitchs", "stitchies", "stitches", "stitchos"],
    "answer": "stitches",
    "explanation": "For stitch, change by adding 'es' at the end."
  },
  {
    "noun": "daisy",
    "options": ["daisys", "daisies", "daisyes", "daisyos"],
    "answer": "daisies",
    "explanation": "Change 'y' to 'ies' because daisy ends with 'y' after a consonant."
  },
  {
    "noun": "rainbow",
    "options": ["rainbows", "rainbowes", "rainbowis", "rainbowos"],
    "answer": "rainbows",
    "explanation": "Just add an 's' to show there are many rainbows."
  },
  {
    "noun": "pencilcase",
    "options": ["pencilcases", "pencilcasees", "pencilcaseis", "pencilcaseos"],
    "answer": "pencilcases",
    "explanation": "Add an 's' at the end to show there is more than one pencilcase."
  },
  {
    "noun": "marker",
    "options": ["markers", "markeres", "markeris", "markeros"],
    "answer": "markers",
    "explanation": "Simply add an 's' because markers come in many."
  },
  {
    "noun": "crayon",
    "options": ["crayons", "crayonies", "crayonis", "crayonos"],
    "answer": "crayons",
    "explanation": "We add an 's' to show there are lots of crayons."
  },
  {
    "noun": "butterfly",
    "options": ["butterflys", "butterflies", "butterflyes", "butterflyos"],
    "answer": "butterflies",
    "explanation": "Change the 'y' to 'ies' because butterfly ends with 'y' after a consonant."
  },
  {
    "noun": "teddy",
    "options": ["teddys", "teddies", "teddyies", "teddyos"],
    "answer": "teddies",
    "explanation": "We add 'ies' by changing 'y' to 'ies' because teddy ends with y."
  },
  {
    "noun": "swing",
    "options": ["swings", "swinges", "swingis", "swingos"],
    "answer": "swings",
    "explanation": "Just add an 's' to show there are many swings on the playground."
  },
  {
    "noun": "slide",
    "options": ["slides", "slidees", "slideis", "slideos"],
    "answer": "slides",
    "explanation": "Simply add an 's' because there are many slides."
  },
  {
    "noun": "sandbox",
    "options": ["sandboxes", "sandboxes", "sandboxis", "sandboxos"],
    "answer": "sandboxes",
    "explanation": "We add 'es' since sandbox ends with 'x'."
  },
  {
    "noun": "dinosaur",
    "options": ["dinosaurs", "dinosaures", "dinosauris", "dinosauros"],
    "answer": "dinosaurs",
    "explanation": "Just add an 's' to show there are many dinosaurs."
  },
  {
    "noun": "rocket",
    "options": ["rockets", "rocketes", "rocketis", "rocketos"],
    "answer": "rockets",
    "explanation": "Simply add an 's' because there are many rockets."
  },
  {
    "noun": "spaceship",
    "options": ["spaceships", "spaceshipes", "spaceshipis", "spaceshipos"],
    "answer": "spaceships",
    "explanation": "Add an 's' to show there are many spaceships."
  },
  {
    "noun": "castle",
    "options": ["castles", "castlees", "castleis", "castleos"],
    "answer": "castles",
    "explanation": "Just add an 's' because castles come in many shapes."
  },
  {
    "noun": "dragon",
    "options": ["dragons", "dragones", "dragonis", "dragonos"],
    "answer": "dragons",
    "explanation": "Simply add an 's' to show there are many dragons in stories."
  },
  {
    "noun": "fairy",
    "options": ["fairys", "fairies", "fairyees", "fairyos"],
    "answer": "fairies",
    "explanation": "Change the 'y' to 'ies' because fairy ends with 'y' after a consonant."
  },
  {
    "noun": "unicorn",
    "options": ["unicorns", "unicornes", "unicornis", "unicornos"],
    "answer": "unicorns",
    "explanation": "Just add an 's' to show there are many unicorns."
  },
  {
    "noun": "tiger",
    "options": ["tigers", "tigeres", "tigeris", "tigeros"],
    "answer": "tigers",
    "explanation": "Simply add an 's' because tigers are many in the jungle."
  },
  {
    "noun": "lion",
    "options": ["lions", "liones", "lionis", "lionos"],
    "answer": "lions",
    "explanation": "Add an 's' to show there are many lions."
  },
  {
    "noun": "bear",
    "options": ["bears", "beares", "bearis", "bearos"],
    "answer": "bears",
    "explanation": "We add an 's' because there are many bears."
  },
  {
    "noun": "zebra",
    "options": ["zebras", "zebraes", "zebrais", "zebraos"],
    "answer": "zebras",
    "explanation": "Just add an 's' to show there are many zebras."
  },
  {
    "noun": "elephant",
    "options": ["elephants", "elephantes", "elephantis", "elephantos"],
    "answer": "elephants",
    "explanation": "Simply add an 's' because elephants are big and many."
  },
  {
    "noun": "giraffe",
    "options": ["giraffes", "giraffees", "giraffeis", "giraffos"],
    "answer": "giraffes",
    "explanation": "We add an 's' at the end to show there are many giraffes."
  },
  {
    "noun": "penguin",
    "options": ["penguins", "penguines", "penguinis", "penguinos"],
    "answer": "penguins",
    "explanation": "Just add an 's' because there are many penguins."
  },
  {
    "noun": "koala",
    "options": ["koalas", "koalaes", "koalais", "koalaos"],
    "answer": "koalas",
    "explanation": "Simply add an 's' to show there are many koalas."
  },
  {
    "noun": "squirrel",
    "options": ["squirrels", "squirreles", "squirrelis", "squirrelos"],
    "answer": "squirrels",
    "explanation": "Add an 's' to show that there are many squirrels."
  },
  {
    "noun": "caterpillar",
    "options": ["caterpillars", "caterpillares", "caterpillaris", "caterpillaros"],
    "answer": "caterpillars",
    "explanation": "We add an 's' because there are lots of caterpillars."
  },
  {
    "noun": "raincoat",
    "options": ["raincoats", "raincoates", "raincoatis", "raincoatos"],
    "answer": "raincoats",
    "explanation": "Simply add an 's' to show there are many raincoats."
  },
  {
    "noun": "backpack",
    "options": ["backpacks", "backpackes", "backpackis", "backpackos"],
    "answer": "backpacks",
    "explanation": "Just add an 's' because many kids have backpacks."
  },
  {
    "noun": "jelly",
    "options": ["jellies", "jellys", "jellyes", "jellyos"],
    "answer": "jellies",
    "explanation": "Change 'y' to 'ies' because jelly ends with 'y' after a consonant."
  },
  {
    "noun": "bookcase",
    "options": ["bookcases", "bookcasees", "bookcaseis", "bookcaseos"],
    "answer": "bookcases",
    "explanation": "We add an 's' to show that there are many bookcases."
  },
  {
    "noun": "lamp",
    "options": ["lamps", "lampes", "lampis", "lampos"],
    "answer": "lamps",
    "explanation": "Simply add an 's' to show there are many lamps."
  },
  {
    "noun": "candle",
    "options": ["candles", "candlees", "candleis", "candleos"],
    "answer": "candles",
    "explanation": "Just add an 's' because there are many candles."
  },
  {
    "noun": "sugar",
    "options": ["sugars", "sugares", "sugaris", "sugaros"],
    "answer": "sugars",
    "explanation": "We add an 's' to show there are many types of sugar."
  }
]

];

// Fetch user-selected number of questions
const selectedNumber = parseInt(localStorage.getItem("wordCount"), 10) || quizData.length;
const shuffledQuizData = quizData.sort(() => 0.5 - Math.random()).slice(0, selectedNumber);

// Global variables
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
const totalQuestions = shuffledQuizData.length;

// DOM elements
const questionCountElem = document.getElementById("questionCount");
const questionElem = document.getElementById("question");
const optionsContainer = document.getElementById("optionsContainer");
const quizBox = document.getElementById("quizBox");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");

// Load the current question
function loadQuestion() {
  clearFeedback();
  if (currentIndex < totalQuestions) {
    showQuestion();
  } else {
    showResult();
  }
}

// Shuffle options array
function shuffleArray(array) {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Display current question
function showQuestion() {
  const currentQuestion = shuffledQuizData[currentIndex];
  questionCountElem.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
  questionElem.textContent = `${currentQuestion.noun.charAt(0).toUpperCase() + currentQuestion.noun.slice(1)}`;

  optionsContainer.innerHTML = "";
  const randomizedOptions = shuffleArray(currentQuestion.options);

  randomizedOptions.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("interactive-btn");
    btn.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    btn.onclick = () => checkAnswer(btn, currentQuestion.answer, currentQuestion.explanation);
    optionsContainer.appendChild(btn);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "Back";
  backBtn.classList.add("interactive-btn");
  backBtn.style.marginTop = "1rem";
  backBtn.onclick = () => window.location.href = "select.html";
  optionsContainer.parentNode.appendChild(backBtn);
}

// Check user's answer and provide explanation
function checkAnswer(selectedBtn, correctAnswer, explanation) {
  const allButtons = optionsContainer.querySelectorAll("button");
  allButtons.forEach(btn => btn.disabled = true);

  const feedbackElem = document.createElement("p");
  feedbackElem.style.fontWeight = "bold";
  feedbackElem.style.fontSize = "2rem";
  feedbackElem.style.padding = "0.5rem";
  feedbackElem.style.margin = "0.5rem auto";
  feedbackElem.style.textAlign = "center";

  if (selectedBtn.textContent.toLowerCase() === correctAnswer.toLowerCase()) {
    selectedBtn.classList.add("correct");
    correctCount++;
    feedbackElem.textContent = "Correct!";
    feedbackElem.style.backgroundColor = "#d4edda";
    feedbackElem.style.color = "green";
  } else {
    selectedBtn.classList.add("incorrect");
    allButtons.forEach(btn => {
      if (btn.textContent.toLowerCase() === correctAnswer.toLowerCase()) {
        btn.classList.add("correct");
      }
    });
    feedbackElem.textContent = "Wrong :(";
    feedbackElem.style.backgroundColor = "#f8d7da";
    feedbackElem.style.color = "red";
    wrongCount++;
  }

  const explanationElem = document.createElement("p");
  explanationElem.classList.add("explanation-text");
  explanationElem.textContent = `Explanation: ${explanation}`;

  optionsContainer.parentNode.appendChild(feedbackElem);
  optionsContainer.parentNode.appendChild(explanationElem);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add("interactive-btn");
  nextBtn.onclick = () => nextQuestion();
  optionsContainer.parentNode.appendChild(nextBtn);
}

// Clear feedback from previous question
function clearFeedback() {
  document.querySelectorAll(".explanation-text, .interactive-btn, p[style]").forEach(elem => {
    if (elem !== questionElem && elem.parentNode !== optionsContainer) {
      elem.remove();
    }
  });
}

// Proceed to the next question
function nextQuestion() {
  currentIndex++;
  loadQuestion();
}

// Show the final results
function showResult() {
  quizBox.style.display = "none";
  resultBox.style.display = "block";
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  scoreText.textContent = `You got ${correctCount}/${totalQuestions} correct (${percentage}%)`;

  const finalMessage = document.createElement("p");
  finalMessage.style.fontSize = "2rem";
  finalMessage.style.backgroundColor = "lightyellow";
  finalMessage.style.padding = "0.5rem";
  finalMessage.style.textAlign = "center";
  finalMessage.style.margin = "0.5rem auto";
  finalMessage.textContent = `You got ${correctCount}/${totalQuestions} correct (${percentage}%)`;

  const tryAgainBtn = document.createElement("button");
  tryAgainBtn.textContent = "Try Again";
  tryAgainBtn.classList.add("interactive-btn");
  tryAgainBtn.onclick = () => window.location.reload();

  const backBtn = document.createElement("button");
  backBtn.textContent = "Back";
  backBtn.classList.add("interactive-btn");
  backBtn.onclick = () => window.location.href = "select.html";

  resultBox.innerHTML = "";
  resultBox.appendChild(finalMessage);
  resultBox.appendChild(tryAgainBtn);
  resultBox.appendChild(backBtn);

  saveQuizResult("english_plural");
}

// Save results to local storage
function saveQuizResult(mode) {
  const logs = JSON.parse(localStorage.getItem("quizResults") || "[]");
  logs.push({
    mode,
    date: new Date().toISOString(),
    total: totalQuestions,
    correct: correctCount,
    wrong: wrongCount
  });
  localStorage.setItem("quizResults", JSON.stringify(logs));
}

// Initialize quiz
window.addEventListener("DOMContentLoaded", loadQuestion);
