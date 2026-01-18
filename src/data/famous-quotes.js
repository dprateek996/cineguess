/**
 * Famous Movie Quotes Database
 * 
 * Used as fallback when Gemini API is unavailable or rate-limited.
 * Contains iconic quotes that don't reveal the movie title.
 */

export const famousQuotes = {
    // Hollywood Classics
    "The Godfather": "I'm gonna make him an offer he can't refuse.",
    "The Godfather Part II": "Keep your friends close, but your enemies closer.",
    "Titanic": "I'm the king of the world!",
    "Forrest Gump": "Life is like a box of chocolates. You never know what you're gonna get.",
    "The Dark Knight": "Why so serious?",
    "Fight Club": "The first rule is: you do not talk about it.",
    "Inception": "You mustn't be afraid to dream a little bigger, darling.",
    "The Matrix": "There is no spoon.",
    "Pulp Fiction": "Say 'what' again. I dare you. I double dare you.",
    "The Shawshank Redemption": "Get busy living, or get busy dying.",
    "Gladiator": "Are you not entertained?",
    "Terminator 2: Judgment Day": "Hasta la vista, baby.",
    "The Terminator": "I'll be back.",
    "Star Wars": "May the Force be with you.",
    "The Empire Strikes Back": "No, I am your father.",
    "Jaws": "You're gonna need a bigger boat.",
    "E.T. the Extra-Terrestrial": "Phone home.",
    "Casablanca": "Here's looking at you, kid.",
    "The Wizard of Oz": "There's no place like home.",
    "The Lion King": "Remember who you are.",
    "Toy Story": "To infinity and beyond!",
    "Finding Nemo": "Just keep swimming.",
    "Avatar": "I see you.",
    "Avengers: Endgame": "I love you 3000.",
    "Iron Man": "I am Iron Man.",
    "Spider-Man": "With great power comes great responsibility.",
    "Interstellar": "Love is the one thing that transcends time and space.",
    "The Prestige": "Are you watching closely?",
    "The Social Network": "A million dollars isn't cool. You know what's cool? A billion dollars.",
    "Joker": "I used to think my life was a tragedy, but now I realize it's a comedy.",
    "The Hangover": "What happens in Vegas stays in Vegas. Except herpes. That comes back with you.",
    "Shutter Island": "Which would be worse – to live as a monster, or to die as a good man?",
    "Django Unchained": "The 'D' is silent.",
    "The Wolf of Wall Street": "The only thing standing between you and your goal is the story you keep telling yourself.",

    // Bollywood
    "3 Idiots": "All is well.",
    "Sholay": "Kitne aadmi the?",
    "Dilwale Dulhania Le Jayenge": "Bade bade desh mein aise choti choti baatein hoti rehti hain.",
    "Dangal": "Mhaari choriyan choro se kam hai ke?",
    "Lagaan: Once Upon a Time in India": "Is baar hum jeetenge!",
    "PK": "Wrong number.",
    "Zindagi Na Milegi Dobara": "Seize the day, seize the moment.",
    "Kabhi Khushi Kabhie Gham": "Kuch kuch hota hai, tum nahi samjhoge.",
    "My Name Is Khan": "My name is Khan, and I am not a terrorist.",
    "Like Stars on Earth": "Every child is special.",
    "Dil Chahta Hai": "Dosti mein no sorry, no thank you.",
    "Bajrangi Bhaijaan": "Jai Hanuman.",
    "Queen": "Paris chalo!",
    "Barfi!": "Silence speaks louder than words.",

    // Anime
    "Spirited Away": "Once you've met someone you never really forget them.",
    "Your Name.": "I wanted to tell you... that wherever you are in this world, I'll search for you.",
    "My Neighbor Totoro": "A catbus! A catbus!",
    "Howl's Moving Castle": "A heart's a heavy burden.",
    "Princess Mononoke": "Life is suffering. It is hard. The world is cursed. But still you find reasons to keep living.",
    "Demon Slayer -Kimetsu no Yaiba- The Movie: Mugen Train": "Set your heart ablaze!",
    "Jujutsu Kaisen 0": "I'll always love you.",
    "One Piece Film: Red": "I want to create a new world with my songs.",
    "Pokémon 3: The Movie": "I wish for a legendary partner.",
    "Dragon Ball Super: Broly": "Saiyans are a warrior race!",
    "Weathering with You": "I wished for clear weather, so that I could meet you again.",
    "A Silent Voice": "I'm sorry... for not hearing your voice.",
    "Grave of the Fireflies": "Why do fireflies have to die so soon?",

    // More Hollywood
    "The Avengers": "I have an army. We have a Hulk.",
    "Black Panther": "Wakanda Forever!",
    "Thor: Ragnarok": "Revengers... assemble!",
    "Guardians of the Galaxy": "We are Groot.",
    "Captain America: The First Avenger": "I can do this all day.",
    "Wonder Woman": "I believe in love.",
    "The Batman": "I'm vengeance.",
    "Oppenheimer": "Now I am become Death, the destroyer of worlds.",
    "Dune": "Fear is the mind-killer.",
    "John Wick": "Yeah, I'm thinking I'm back.",
    "Top Gun: Maverick": "It's not the plane, it's the pilot.",
    "Mission: Impossible": "Your mission, should you choose to accept it...",
    "Fast & Furious": "I live my life a quarter mile at a time.",
    "Jurassic Park": "Life finds a way.",
    "Back to the Future": "Roads? Where we're going, we don't need roads.",
    "The Sixth Sense": "I see dead people.",
    "A Few Good Men": "You can't handle the truth!",
    "Jerry Maguire": "You had me at hello.",
    "Braveheart": "They may take our lives, but they'll never take our freedom!",
    "Scarface": "Say hello to my little friend!",
    "The Princess Bride": "As you wish.",
    "Apollo 13": "Houston, we have a problem.",
    "Dirty Harry": "Do you feel lucky, punk?",
}

// Get a quote for a movie, with fallback
export function getQuoteForMovie(title) {
    // Try exact match
    if (famousQuotes[title]) {
        return famousQuotes[title]
    }

    // Try case-insensitive match
    const titleLower = title.toLowerCase()
    for (const [movie, quote] of Object.entries(famousQuotes)) {
        if (movie.toLowerCase() === titleLower) {
            return quote
        }
    }

    // Try partial match
    for (const [movie, quote] of Object.entries(famousQuotes)) {
        if (titleLower.includes(movie.toLowerCase()) || movie.toLowerCase().includes(titleLower)) {
            return quote
        }
    }

    return null
}

export default famousQuotes
