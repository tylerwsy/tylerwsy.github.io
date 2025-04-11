import pandas as pd

# The JSON data as a Python list of dictionaries.
data = [
  {
    "noun": "cat",
    "options": ["cats", "cates", "caties", "catys"],
    "answer": "cats",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "dog",
    "options": ["dogs", "doges", "dogis", "dogys"],
    "answer": "dogs",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "church",
    "options": ["churchs", "churhes", "churhces", "churches"],
    "answer": "churches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "dish",
    "options": ["dishs", "dishe", "dishies", "dishes"],
    "answer": "dishes",
    "explanation": "Nouns ending in 'sh' add 'es'."
  },
  {
    "noun": "box",
    "options": ["boxs", "boxies", "boxxes", "boxes"],
    "answer": "boxes",
    "explanation": "Nouns ending in 'x' add 'es'."
  },
  {
    "noun": "bus",
    "options": ["buss", "busis", "busos", "buses"],
    "answer": "buses",
    "explanation": "Nouns ending in 's' add 'es'."
  },
  {
    "noun": "lady",
    "options": ["ladys", "ladiees", "ladies", "ladiees"],
    "answer": "ladies",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "boy",
    "options": ["boyes", "boyys", "boies", "boys"],
    "answer": "boys",
    "explanation": "For nouns ending in 'y' preceded by a vowel, simply add 's'."
  },
  {
    "noun": "leaf",
    "options": ["leafs", "leafees", "leaves", "leafes"],
    "answer": "leaves",
    "explanation": "For nouns ending in 'f', replace 'f' with 'ves'."
  },
  {
    "noun": "wolf",
    "options": ["wolfs", "wolfes", "wolfies", "wolves"],
    "answer": "wolves",
    "explanation": "For nouns ending in 'f', replace 'f' with 'ves'."
  },
  {
    "noun": "knife",
    "options": ["knifes", "knifis", "knivies", "knives"],
    "answer": "knives",
    "explanation": "For nouns ending in 'fe', replace 'fe' with 'ves'."
  },
  {
    "noun": "tomato",
    "options": ["tomatos", "tomatios", "tomatoes", "tomatues"],
    "answer": "tomatoes",
    "explanation": "Nouns ending in 'o' often add 'es'."
  },
  {
    "noun": "potato",
    "options": ["potatos", "potatios", "potatoes", "potatues"],
    "answer": "potatoes",
    "explanation": "Nouns ending in 'o' often add 'es'."
  },
  {
    "noun": "hero",
    "options": ["heros", "heroos", "heroses", "heroes"],
    "answer": "heroes",
    "explanation": "Nouns ending in 'o' preceded by a consonant add 'es'."
  },
  {
    "noun": "echo",
    "options": ["echos", "echoes", "echoos", "echois"],
    "answer": "echoes",
    "explanation": "Nouns ending in 'o' preceded by a consonant add 'es'."
  },
  {
    "noun": "mosquito",
    "options": ["mosquitos", "mosquitoes", "mosquitios", "mosquitees"],
    "answer": "mosquitoes",
    "explanation": "Nouns ending in 'o' often add 'es'."
  },
  {
    "noun": "analysis",
    "options": ["analysises", "analysies", "analysises", "analyses"],
    "answer": "analyses",
    "explanation": "Irregular plural: change 'is' to 'es'."
  },
  {
    "noun": "crisis",
    "options": ["crisises", "crisisies", "crisisos", "crises"],
    "answer": "crises",
    "explanation": "Irregular plural: change 'is' to 'es'."
  },
  {
    "noun": "thesis",
    "options": ["thesises", "thesisies", "thesisos", "theses"],
    "answer": "theses",
    "explanation": "Irregular plural: change 'is' to 'es'."
  },
  {
    "noun": "phenomenon",
    "options": ["phenomenons", "phenomenos", "phenomenies", "phenomena"],
    "answer": "phenomena",
    "explanation": "Irregular plural with a vowel change."
  },
  {
    "noun": "child",
    "options": ["childs", "childes", "childies", "children"],
    "answer": "children",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "man",
    "options": ["mans", "manes", "manis", "men"],
    "answer": "men",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "woman",
    "options": ["womans", "women", "womans", "womien"],
    "answer": "women",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "tooth",
    "options": ["tooths", "toothees", "toothies", "teeth"],
    "answer": "teeth",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "foot",
    "options": ["foots", "footes", "footies", "feet"],
    "answer": "feet",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "mouse",
    "options": ["mouses", "mousees", "mouseis", "mice"],
    "answer": "mice",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "person",
    "options": ["persons", "peoples", "persones", "people"],
    "answer": "people",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "cactus",
    "options": ["cactuses", "cactis", "cacties", "cacti"],
    "answer": "cacti",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "focus",
    "options": ["focuses", "focuss", "focusses", "foci"],
    "answer": "foci",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "fungus",
    "options": ["funguses", "fungis", "fungies", "fungi"],
    "answer": "fungi",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "nucleus",
    "options": ["nucleuses", "nucleis", "nucleos", "nuclei"],
    "answer": "nuclei",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "syllabus",
    "options": ["syllabuses", "syllabos", "syllabis", "syllabi"],
    "answer": "syllabi",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "alumnus",
    "options": ["alumnuses", "alumnis", "alumnas", "alumni"],
    "answer": "alumni",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "bacterium",
    "options": ["bacteriums", "bacterias", "bacteries", "bacteria"],
    "answer": "bacteria",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "datum",
    "options": ["datums", "datas", "daties", "data"],
    "answer": "data",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "memorandum",
    "options": ["memorandums", "memorandes", "memorandis", "memoranda"],
    "answer": "memoranda",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "ox",
    "options": ["oxs", "oxes", "oxies", "oxen"],
    "answer": "oxen",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "goose",
    "options": ["gooses", "goosees", "goosies", "geese"],
    "answer": "geese",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "baby",
    "options": ["babys", "babiees", "babyes", "babies"],
    "answer": "babies",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "city",
    "options": ["citys", "cityes", "cityies", "cities"],
    "answer": "cities",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "party",
    "options": ["partys", "partyes", "partiies", "parties"],
    "answer": "parties",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "story",
    "options": ["storys", "storios", "storyes", "stories"],
    "answer": "stories",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "fox",
    "options": ["foxs", "foxis", "foxos", "foxes"],
    "answer": "foxes",
    "explanation": "Nouns ending in 'x' add 'es'."
  },
  {
    "noun": "quiz",
    "options": ["quizs", "quizes", "quizies", "quizzes"],
    "answer": "quizzes",
    "explanation": "Nouns ending in 'z' add 'zes'."
  },
  {
    "noun": "glass",
    "options": ["glasss", "glases", "glassies", "glasses"],
    "answer": "glasses",
    "explanation": "Nouns ending in a sibilant sound often add 'es'."
  },
  {
    "noun": "dress",
    "options": ["dresss", "dreses", "dressies", "dresses"],
    "answer": "dresses",
    "explanation": "Nouns ending in a sibilant sound often add 'es'."
  },
  {
    "noun": "bush",
    "options": ["bushs", "bushies", "bushos", "bushes"],
    "answer": "bushes",
    "explanation": "Nouns ending in 'sh' add 'es'."
  },
  {
    "noun": "match",
    "options": ["matchs", "matchets", "matchies", "matches"],
    "answer": "matches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "watch",
    "options": ["watchs", "watchies", "wachtes", "watches"],
    "answer": "watches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "studio",
    "options": ["studiios", "studioes", "studius", "studios"],
    "answer": "studios",
    "explanation": "Nouns ending in 'o' preceded by a vowel simply add 's'."
  },
  {
    "noun": "piano",
    "options": ["pianoes", "pianis", "pianoys", "pianos"],
    "answer": "pianos",
    "explanation": "Nouns ending in 'o' preceded by a vowel simply add 's'."
  },
  {
    "noun": "photo",
    "options": ["photoes", "phootos", "photes", "photos"],
    "answer": "photos",
    "explanation": "Nouns ending in 'o' preceded by a vowel simply add 's'."
  },
  {
    "noun": "radio",
    "options": ["radioes", "radious", "radiois", "radios"],
    "answer": "radios",
    "explanation": "Nouns ending in 'o' preceded by a vowel simply add 's'."
  },
  {
    "noun": "volcano",
    "options": ["volcanos", "volcanies", "volcainos", "volcanoes"],
    "answer": "volcanoes",
    "explanation": "Nouns ending in 'o' preceded by a consonant often add 'es'."
  },
  {
    "noun": "buffalo",
    "options": ["buffalos", "buffaloes", "buffalies", "buffaloes"],
    "answer": "buffaloes",
    "explanation": "Nouns ending in 'o' preceded by a consonant add 'es'."
  },
  {
    "noun": "sandwich",
    "options": ["sandwichs", "sandwichees", "sandwichies", "sandwiches"],
    "answer": "sandwiches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "peach",
    "options": ["peachs", "peachies", "peachees", "peaches"],
    "answer": "peaches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "couch",
    "options": ["couchs", "couchies", "couchos", "couches"],
    "answer": "couches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "bench",
    "options": ["benchs", "benchies", "benchos", "benches"],
    "answer": "benches",
    "explanation": "Nouns ending in 'ch' add 'es'."
  },
  {
    "noun": "roof",
    "options": ["roofes", "roofys", "roofis", "roofs"],
    "answer": "roofs",
    "explanation": "Exception: despite ending in 'f', simply add 's'."
  },
  {
    "noun": "half",
    "options": ["halfs", "halfes", "halvies", "halves"],
    "answer": "halves",
    "explanation": "For nouns ending in 'lf', replace 'f' with 'ves'."
  },
  {
    "noun": "calf",
    "options": ["calfs", "calfes", "calvies", "calves"],
    "answer": "calves",
    "explanation": "For nouns ending in 'lf', replace 'f' with 'ves'."
  },
  {
    "noun": "elf",
    "options": ["elfs", "elfies", "elfes", "elves"],
    "answer": "elves",
    "explanation": "For nouns ending in 'lf', replace 'f' with 'ves'."
  },
  {
    "noun": "self",
    "options": ["selfs", "selfes", "selfies", "selves"],
    "answer": "selves",
    "explanation": "Irregular plural: change to 'selves'."
  },
  {
    "noun": "chief",
    "options": ["chieves", "chievis", "chiefes", "chiefs"],
    "answer": "chiefs",
    "explanation": "Exception: despite ending in 'f', simply add 's'."
  },
  {
    "noun": "proof",
    "options": ["proofes", "proofis", "prooffs", "proofs"],
    "answer": "proofs",
    "explanation": "Exception: simply add 's'."
  },
  {
    "noun": "deer",
    "options": ["deers", "deeres", "deeris", "deer"],
    "answer": "deer",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "sheep",
    "options": ["sheeps", "sheepees", "sherimpes", "sheep"],
    "answer": "sheep",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "species",
    "options": ["speciess", "specises", "speciis", "species"],
    "answer": "species",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "series",
    "options": ["seriess", "seriies", "serieses", "series"],
    "answer": "series",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "aircraft",
    "options": ["aircrafts", "aircrafs", "aircrafes", "aircraft"],
    "answer": "aircraft",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "hovercraft",
    "options": ["hovercrafts", "hovercrafs", "hovercrafes", "hovercraft"],
    "answer": "hovercraft",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "scarf",
    "options": ["scarfs", "scarfes", "scarfis", "scarves"],
    "answer": "scarves",
    "explanation": "For some nouns ending in 'f', replace with 'ves'."
  },
  {
    "noun": "shelf",
    "options": ["shelfs", "sheleves", "shelvies", "shelves"],
    "answer": "shelves",
    "explanation": "For nouns ending in 'lf', replace with 'ves'."
  },
  {
    "noun": "louse",
    "options": ["louses", "lousees", "lousies", "lice"],
    "answer": "lice",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "die",
    "options": ["dies", "diees", "diece", "dice"],
    "answer": "dice",
    "explanation": "Irregular plural form for the singular of 'dice'."
  },
  {
    "noun": "appendix",
    "options": ["appendixes", "appendicex", "appendicis", "appendices"],
    "answer": "appendices",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "matrix",
    "options": ["matrixes", "matrixis", "matrixos", "matrices"],
    "answer": "matrices",
    "explanation": "Latin-derived irregular plural form: change 'x' to 'ces'."
  },
  {
    "noun": "vertex",
    "options": ["vertexes", "vertexis", "vertexos", "vertices"],
    "answer": "vertices",
    "explanation": "Latin-derived irregular plural form: change ending to 'ices'."
  },
  {
    "noun": "index",
    "options": ["indexes", "indexs", "indexies", "indices"],
    "answer": "indices",
    "explanation": "Latin-derived irregular plural form."
  },
  {
    "noun": "basis",
    "options": ["basises", "basises", "basies", "bases"],
    "answer": "bases",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "axis",
    "options": ["axises", "axisies", "axos", "axes"],
    "answer": "axes",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "criterion",
    "options": ["criterion", "criterions", "criterias", "criteria"],
    "answer": "criteria",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "thief",
    "options": ["thiefs", "thiefes", "thiefis", "thieves"],
    "answer": "thieves",
    "explanation": "For nouns ending in 'f', replace with 'ves'."
  },
  {
    "noun": "cuff",
    "options": ["cuffes", "cuffis", "cuffies", "cuffs"],
    "answer": "cuffs",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "puff",
    "options": ["puffes", "puffis", "puffies", "puffs"],
    "answer": "puffs",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "buff",
    "options": ["buffes", "buffis", "buffies", "buffs"],
    "answer": "buffs",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "jacket",
    "options": ["jacketes", "jacketis", "jacketos", "jackets"],
    "answer": "jackets",
    "explanation": "Standard rule: simply add 's'."
  },
  {
    "noun": "loaf",
    "options": ["loafs", "loafes", "loafis", "loaves"],
    "answer": "loaves",
    "explanation": "For nouns ending in 'f', replace 'f' with 'ves'."
  },
  {
    "noun": "belief",
    "options": ["beliefes", "belifes", "beliefis", "beliefs"],
    "answer": "beliefs",
    "explanation": "Exception: despite ending in 'f', simply add 's'."
  },
  {
    "noun": "penny",
    "options": ["pennys", "pennyes", "penniees", "pennies"],
    "answer": "pennies",
    "explanation": "For nouns ending in 'y' preceded by a consonant, replace 'y' with 'ies'."
  },
  {
    "noun": "bay",
    "options": ["bayes", "bayys", "bayies", "bays"],
    "answer": "bays",
    "explanation": "For nouns ending in 'y' preceded by a vowel, simply add 's'."
  },
  {
    "noun": "alga",
    "options": ["algas", "algaes", "algais", "algae"],
    "answer": "algae",
    "explanation": "Irregular plural form."
  },
  {
    "noun": "bison",
    "options": ["bisons", "bisones", "bisonis", "bison"],
    "answer": "bison",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "shrimp",
    "options": ["shrimps", "shrimpees", "shrimpes", "shrimp"],
    "answer": "shrimp",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "cod",
    "options": ["cods", "code", "codies", "cod"],
    "answer": "cod",
    "explanation": "Irregular plural: remains the same."
  },
  {
    "noun": "graffito",
    "options": ["graffitos", "graffitie", "graffitis", "graffiti"],
    "answer": "graffiti",
    "explanation": "Irregular plural form from Italian."
  },
  {
    "noun": "spectrum",
    "options": ["spectrumes", "spectrums", "spectries", "spectra"],
    "answer": "spectra",
    "explanation": "Irregular plural form from Latin."
  },
  {
    "noun": "stadium",
    "options": ["stadiums", "stadies", "stadios", "stadia"],
    "answer": "stadia",
    "explanation": "Irregular plural form from Latin."
  },
  {
    "noun": "crucifix",
    "options": ["crucifixes", "crucifixs", "crucifixies", "crucifixes"],
    "answer": "crucifixes",
    "explanation": "Nouns ending in 'x' add 'es' with modification."
  }
]

# Prepare the rows for our DataFrame.
rows = []
for item in data:
    row = {
        "Noun": item["noun"],
        "Option1": item["options"][0],
        "Option2": item["options"][1],
        "Option3": item["options"][2],
        "Option4": item["options"][3],
        "Answer": item["answer"],
        "Explanation": item["explanation"]
    }
    rows.append(row)

# Create a DataFrame.
df = pd.DataFrame(rows)

# Write to an Excel file.
df.to_excel("nouns.xlsx", index=False)

print("Excel file 'nouns.xlsx' has been generated successfully.")
