/**
 * HEADLINERS — A Festival-Building Board Game Prototype
 * =====================================================
 * Build the biggest and best festival over 4 years (rounds).
 * 2–5 players compete to earn Victory Points through ticket sales,
 * amenity placement, artist booking, and fame.
 *
 * Core mechanics:
 *  - Hex-grid festival board (13×13) with stage placement
 *  - 1 action per turn: Pick Amenity (dice), Move Amenity, or Book/Reserve Artist
 *  - Artists have costs (fame + amenities), genres, VP, tickets, and effects
 *  - 3 artists per stage; the 3rd is the Headliner (effect triggers twice)
 *  - First full lineup bonus: +5 tickets
 *  - Campsites generate 5 tickets each
 *  - 10 tickets = 1 VP at year end
 *  - Fame level 5 unlocks new stage placement between rounds
 *  - After 4 years, highest VP wins (tiebreak: most tickets)
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// ARTIST DATA (75 artists from spreadsheet)
// ═══════════════════════════════════════════════════════════
const ALL_ARTISTS = [{"name": "Kara Okay", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Sadchild", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "Mikerophone", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Rebecca Black", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Jamiroquai", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop, Funk", "tickets": 2, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Jonas Brothers", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Remi Wolf", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Maroon 5", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 VP per other pop act on this stage"}, {"name": "Dua Lipa", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Scissor Sisters", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Chappell Roan", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Clairo", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Indie", "tickets": 3, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "RAYE", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Nelly", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Pop, Hip Hop", "tickets": 4, "effect": "-4 VP / +1 Fame"}, {"name": "Harry Styles", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "+Fame"}, {"name": "Billie Eilish", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 3, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "Sign 1 artist from the artist deck or the available artist pool."}, {"name": "Beyonce", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Olivia Dean", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 4, "effect": ""}, {"name": "Coldplay", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 3, "cateringCost": 2, "portalooCost": 1, "genre": "Pop, Rock", "tickets": 5, "effect": "Year End: '+1 VP / Fame gained this year"}, {"name": "Lady Gaga", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Pop, Electronic", "tickets": 5, "effect": "Year End: '+1 VP if you have the highest Fame. '+3 VP if you have the highest Fame AND the most tickets."}, {"name": "Sitting Ducks", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Beababdoobee", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Limp Bizkit", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "No Doubt", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Vampire Weekend", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "The Darkness", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Royal Blood", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Heart", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 2, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "The Kooks", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 3, "effect": ""}, {"name": "Wet Leg", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 3, "effect": "+1 VP per other Rock act on this stage"}, {"name": "Blondie", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 3, "effect": ""}, {"name": "Rage Against the Machine", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Rock, Funk", "tickets": 3, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Beastie Boys", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Hip Hop", "tickets": 3, "effect": ""}, {"name": "David Bowie", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Roll all amenity dice and gain 1 Fame if a Fame shows."}, {"name": "Slipknot", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Olivia Rodrigo", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Pop", "tickets": 4, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "Radiohead", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Rock, Electronic", "tickets": 4, "effect": ""}, {"name": "Arctic Monkeys", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": ""}, {"name": "Foo Fighters", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 Amenity Dice. +1VP for each unique amenity that shows"}, {"name": "Fleetwood Mac", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 3, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 dice. +1 VP per die showing the most common result"}, {"name": "Lil Angry", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Loosey Goosey", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Pop", "tickets": 2, "effect": ""}, {"name": "Knucks", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Eve", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "-1 VP. Sell 3 tickets."}, {"name": "KAYTRANADA", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Electronic", "tickets": 2, "effect": ""}, {"name": "Lil Dicky", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "+1 Security. Place this turn."}, {"name": "Salt-N-Pepa", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Ja Rule", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Ms Banks", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Doja Cat", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": ""}, {"name": "De La Soul", "fame": 2, "vp": 4, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 3, "effect": "+1 VP per other Hip Hop act on this stage"}, {"name": "Snoop Dogg", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop, Funk", "tickets": 3, "effect": ""}, {"name": "Loyle Carner", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Hip Hop, Rock", "tickets": 3, "effect": "-2 VP for 1 Fame. Roll 1 amenity dice and gain 1 Fame for each Fame shown."}, {"name": "Little Simz", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop, Indie", "tickets": 3, "effect": ""}, {"name": "Dave", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": "-3 VP. Gain 1 Fame."}, {"name": "Missy Elliott", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 4, "effect": "-2 VP. Draw an artist objective."}, {"name": "Lauryn Hill", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Nas", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 3, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Kendrick Lamar", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 3, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: -3 VP. Sell 15 tickets."}, {"name": "Eminem", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: +1 VP / Hip Hop artist you've played this Year"}, {"name": "CRUEL MISTRESS", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "808 DYLAN", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Horsegiirl", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "Grimes", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "FISHER", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "Romy", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "The Chainsmokers", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "CHVRCHES", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Jamie xx", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Indie", "tickets": 3, "effect": ""}, {"name": "Pink Pantheress", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Pop", "tickets": 3, "effect": "+1 VP per other Electronic artist on this stage"}, {"name": "Flume", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Electronic, Hip Hop", "tickets": 3, "effect": "-1 VP. Gain +1 ticket / 2 amenities."}, {"name": "Opolopo", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Funk", "tickets": 3, "effect": ""}, {"name": "Peggy Gou", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Chase & Status", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "+1 VP per other Electronic artist on this stage"}, {"name": "Charli XCX", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Electronic, Pop", "tickets": 3, "effect": "+1 Fame if you have played 2 artists of either Electronic or Pop."}, {"name": "The Chemical Brothers", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Linkin Park", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Rock", "tickets": 3, "effect": "+1 Fame"}, {"name": "Skrillex", "fame": 3, "vp": 5, "campCost": 3, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 3, "effect": ""}, {"name": "Daft Punk", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+1 VP / 3 Amenities"}, {"name": "Fatboy Slim", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+1 VP / Council Objective that is currently giving you a benefit"}, {"name": "Bruised Brothers", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Ayle", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie, Hip Hop", "tickets": 2, "effect": "Sign one artist. You may refresh the available artists before or after you draw."}, {"name": "Mickey Raven", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Djo", "fame": 1, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Two Door Cinema Club", "fame": 1, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Boygenius", "fame": 1, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "The Kooks", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Christine & The Queens", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "Djo", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "Suki Waterhouse", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+1 VP per other Indie artist on this stage"}, {"name": "Mitski", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "CMAT", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie, Pop", "tickets": 3, "effect": "+1 Global Event"}, {"name": "Florence & The Machine", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+5 ticket sales"}, {"name": "Lana Del Rey", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 Fame"}, {"name": "Hozier", "fame": 3, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 VP"}, {"name": "Joy Division", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Tame Impala", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Indie, Electronic", "tickets": 4, "effect": "+1 Amenity"}, {"name": "The Strokes", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 3, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Gorillaz", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 2, "portalooCost": 2, "genre": "Indie", "tickets": 5, "effect": "Gain 1VP per existing campsite in your festival."}, {"name": "The Cure", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 3, "genre": "Indie, Rock", "tickets": 5, "effect": "Immediately book another Indie or Rock artist."}, {"name": "Bella Labelle", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck."}, {"name": "Redcar", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Backseat", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Teena Marie", "fame": 1, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "Discard one artist from your hand to gain 3 tickets."}, {"name": "Commodores", "fame": 1, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Rick James", "fame": 1, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 2, "effect": "Discard two artists from your hand to gain the ticket cost of one of them."}, {"name": "Vulfpeck", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Indie", "tickets": 2, "effect": ""}, {"name": "War", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Parliament", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Evelyn \"Champagne\" King:", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": "+1 VP per other Funk artist on this stage"}, {"name": "Cameo", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Khruangbin", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Sly & The Family Stone", "fame": 2, "vp": 4, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 3, "effect": "+1 VP"}, {"name": "Betty Davis", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 4, "effect": "Discard one amenity, gain 5 tickets"}, {"name": "Thundercat", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+4 ticket sales"}, {"name": "Earth, Wind & Fire", "fame": 4, "vp": 6, "campCost": 0, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk", "tickets": 4, "effect": ""}, {"name": "Chaka Khan", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Event"}, {"name": "Nile Rogers & Chic", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Fame"}, {"name": "Silk Sonic", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk, Pop", "tickets": 5, "effect": "Discard two artists from your hand, then draw the top artist from the deck and play it for free."}, {"name": "Prince", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 3, "portalooCost": 1, "genre": "Funk", "tickets": 5, "effect": "+1 VP per other artist on all of your stages."}];

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const HEX_SIZE = 22;
const GRID_COLS = 13;
const GRID_ROWS = 13;
const AMENITY_TYPES = ["campsite", "security", "catering", "portaloo"];
const AMENITY_LABELS = { campsite: "Campsite", portaloo: "Portaloo", security: "Security", catering: "Catering Van" };
const AMENITY_ICONS = { campsite: "⛺", portaloo: "🚽", security: "👮‍♀️", catering: "🍔" };
const AMENITY_COLORS = { campsite: "#4ade80", portaloo: "#60a5fa", security: "#f87171", catering: "#fbbf24" };
const DICE_OPTIONS = ["campsite", "portaloo", "security", "catering", "catering_or_portaloo", "security_or_campsite", "fame"];
const TURNS_PER_YEAR = { 1: 6, 2: 7, 3: 8, 4: 9 };
const FAME_MAX = 5;
const GENRE_COLORS = { Pop: "#ec4899", Rock: "#ef4444", Electronic: "#94a3b8", "Hip Hop": "#f97316", Indie: "#22c55e", Funk: "#a855f7" };
const ALL_GENRES = ["Pop", "Rock", "Electronic", "Hip Hop", "Indie", "Funk"];

function generateMicrotrends() {
  const shuffled = shuffle([...ALL_GENRES]);
  return [{ genre: shuffled[0], claimedBy: null }, { genre: shuffled[1], claimedBy: null }];
}
const STAGE_NAMES = [
  "The Pyramid","The Beacon","Sunset Strip","The Warehouse","Neon Tent",
  "Echo Chamber","Thunder Dome","The Lighthouse","Starlight Arena","Cloud Nine",
  "The Cavern","Solar Stage","Bass Cathedral","The Orchid","Iron Forge",
  "Moonlit Meadow","The Hive","Crystal Palace","Wildfire Ring","The Oasis"
];
const STAGE_COLORS = [
  "#e11d48","#7c3aed","#0891b2","#16a34a","#ea580c",
  "#c026d3","#2563eb","#ca8a04","#dc2626","#059669",
  "#8b5cf6","#d97706","#0d9488","#be185d","#4f46e5"
];
const RANDOM_NAMES = [
  "Glastonbury 2.0","Mudstock","Basswave","Sunblaze","Neon Fields",
  "Echo Valley","Thunderdome","Starlight Meadow","Cosmic Grove","Rhythmia",
  "Pulse Festival","Wildfire Fest","Dreamscape","Horizon Fest","Moonrise",
  "Voltage","Zenith Fest","Solstice Sound","Inferno Fest","Aurora Nights"
];
const AI_NAMES = ["RoboFest","AutoStage","ByteBeats","CyberGrove","NeuralNights"];

const ALL_OBJECTIVES = [
  { name: "Popstars", genre: "Pop", desc: "Feature full Pop lineups", req: "All 3 artists on a stage are Pop", reward1: "Draw 1 Pop artist from pool at round start", reward2: "+1 Fame + draw 1 Pop artist" },
  { name: "Rock On", genre: "Rock", desc: "Feature full Rock lineups", req: "All 3 artists on a stage are Rock", reward1: "Roll 3 dice at round start, +1 ticket per Fame shown", reward2: "+1 Fame + roll 3 dice" },
  { name: "Disc Jockeys", genre: "Electronic", desc: "Feature full Electronic lineups", req: "All 3 artists on a stage are Electronic", reward1: "Place 1 free amenity at round start", reward2: "+1 Fame + place 1 free amenity" },
  { name: "Fire Verses", genre: "Hip Hop", desc: "Feature full Hip Hop lineups", req: "All 3 artists on a stage are Hip Hop", reward1: "Peek at top 3 events, discard 1", reward2: "+1 Fame + peek at top 3 events" },
  { name: "Indiependent", genre: "Indie", desc: "Feature full Indie lineups", req: "All 3 artists on a stage are Indie", reward1: "Every other player gains +1 ticket", reward2: "+1 Fame + every other player gains +1 ticket" },
  { name: "Funk Town", genre: "Funk", desc: "Feature full Funk lineups", req: "All 3 artists on a stage are Funk", reward1: "Draw 1 card from deck to hand", reward2: "+1 Fame + draw 1 card from deck" },
];

const FAME_VP = { 0: 0, 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 };

const ALL_GOALS = [
  { id: "royal_flush", name: "Royal Flush", trackKey: "portalooRefreshes",
    desc: "Refresh the artist pool with a portaloo 5 times", target: 5 },
  { id: "marketing_gimmicks", name: "Marketing Gimmicks", trackKey: "fameDieRolls",
    desc: "Gain Fame from the amenity dice 4 times", target: 4 },
  { id: "its_a_sign", name: "It's a Sign", trackKey: "artistsSigned",
    desc: "Sign an artist to hand 4 times", target: 4 },
  { id: "government_catering", name: "Government Catering", trackKey: "councilsBought",
    desc: "Buy a council objective with catering 3 times", target: 3 },
  { id: "locking_it_down", name: "Locking it Down", trackKey: "eventsBlocked",
    desc: "Avoid 5 events with security", target: 5 },
];

const ALL_COUNCIL_OBJECTIVES = [
  // Campsite-focused
  { id: "glamping", name: "Glamping", flavour: "Exclusive camping areas.", req: "Campsite, portaloo and security in a cluster", benefit: "+7 tickets/cluster" },
  { id: "put_a_lid", name: "Put a Lid on It", flavour: "Campers don't want to live next to a toilet.", req: "Campsite 2 tiles away from a portaloo", benefit: "+5 tickets/pair" },
  { id: "quiet_camping", name: "Quiet Camping", flavour: "Campers should sleep well.", req: "Campsite at least 3 tiles away from a stage", benefit: "+2 tickets/campsite" },
  { id: "eat_local", name: "Eat Local", flavour: "Food close to camp.", req: "Campsite next to a catering van", benefit: "+3 tickets/pair" },
  { id: "party_animals", name: "Party Animals", flavour: "Some campers love being close to the action.", req: "Campsites between stages", benefit: "+3 tickets/campsite", requiresMultiStage: true },
  { id: "good_nights_sleep", name: "Good Night's Sleep", flavour: "Space for everyone.", req: "Two campsites with an empty tile between them", benefit: "+4 tickets/pair" },
  { id: "well_rested", name: "Well Rested", flavour: "Plenty of room for campers.", req: "Own more campsites than stages", benefit: "+2 tickets/campsite" },
  { id: "we_came_to_party", name: "We Came Here to Party", flavour: "Who needs sleep?", req: "Own less campsites than stages", benefit: "+3 tickets/campsite" },
  { id: "camp_kitchens", name: "Camp Kitchens", flavour: "Campers prefer to cook their own food.", req: "Own more campsites than catering vans", benefit: "+2 tickets/campsite" },
  // Portaloo-focused
  { id: "his_and_hers", name: "His and Hers", flavour: "Equal facilities for everyone.", req: "Own an even number of portaloos", benefit: "+4 tickets/2 portaloos" },
  { id: "urinal_cakes", name: "Urinal Cakes", flavour: "More portaloos means happier people.", req: "Own more portaloos than catering", benefit: "+3 tickets/portaloo" },
  { id: "in_n_out", name: "In N Out", flavour: "Strategic food and toilets.", req: "Portaloos two tiles away from catering vans", benefit: "+6 tickets/pair" },
  { id: "vipee_areas", name: "VIPee Areas", flavour: "Guarded facilities.", req: "Portaloos with security at most 2 tiles away", benefit: "+6 tickets/pair" },
  { id: "number_one_fans", name: "Number One Fans", flavour: "Portaloos near the action.", req: "Portaloos next to stages with Pop, Indie or Rock artist", benefit: "+3 tickets/artist" },
  { id: "funky_smells", name: "Funky Smells", flavour: "Some genres attract bigger queues.", req: "Portaloos next to stages with Electronic, Funk or Hip Hop artist", benefit: "+3 tickets/artist" },
  // Security-focused
  { id: "neighbourhood_watch", name: "Neighbourhood Watch", flavour: "Heavy security presence.", req: "Own more security than campsites", benefit: "+2 tickets/security" },
  { id: "organised_fun", name: "Organised Fun", flavour: "Keeping things under control.", req: "Own more security than stages", benefit: "+3 tickets/security" },
  { id: "shepherds", name: "Shepherds", flavour: "Guiding people between stages.", req: "Security on tiles between two stages", benefit: "+2 tickets/security", requiresMultiStage: true },
  { id: "barrier_hoppers", name: "Barrier Hoppers", flavour: "Stop people sneaking in.", req: "Security on the edge of the festival", benefit: "+3 tickets/security" },
  { id: "no_wristband", name: "No Wristband, No Entry", flavour: "Checkpoints between camps and stages.", req: "Security between a campsite and a stage (in a line)", benefit: "+5 tickets/security" },
  { id: "secret_herbs", name: "Secret Herbs and Spices", flavour: "Keep the recipes safe.", req: "Security beside catering van", benefit: "+6 tickets/pair" },
  { id: "sniffer_dogs", name: "Sniffer Dogs", flavour: "Stamp down on illegal substances.", req: "Two security with an empty tile between them", benefit: "+6 tickets/pair" },
  { id: "entourage", name: "Entourage", flavour: "VIP protection.", req: "Security next to stages with Pop, Hip Hop or Funk artist", benefit: "+3 tickets/artist" },
  { id: "bass_to_face", name: "Bass to the Face", flavour: "Mosh pit management.", req: "Security next to stages with Indie, Rock or Electronic artist", benefit: "+3 tickets/artist" },
  { id: "muscle_food", name: "Muscle Food", flavour: "Guards need feeding too.", req: "Own more security than catering vans", benefit: "+2 tickets/security" },
  // Catering-focused
  { id: "stage_sandwich", name: "Stage Sandwich", flavour: "Food between the action.", req: "Catering vans between two stages (within 3 tiles of each)", benefit: "+3 tickets/catering", requiresMultiStage: true },
  { id: "hydration_stations", name: "Hydration Stations", flavour: "Keep festival-goers hydrated.", req: "Own more catering vans than campsites", benefit: "+3 tickets/catering" },
  { id: "food_festival", name: "Food Festival", flavour: "A festival within a festival.", req: "Own more catering vans than stages", benefit: "+3 tickets/catering" },
  { id: "healthy_clientele", name: "Healthy Clientele", flavour: "Popular catering spot.", req: "Catering vans beside two campsites", benefit: "+9 tickets/qualifying catering" },
  { id: "liquid_lunches", name: "Liquid Lunches", flavour: "Drinks and toilets together.", req: "Catering vans beside two portaloos", benefit: "+9 tickets/qualifying catering" },
  { id: "beef", name: "Beef", flavour: "Rival food vendors want their own space.", req: "Two catering vans with two empty tiles between them", benefit: "+6 tickets/pair" },
  // Genre-amenity bridges
  { id: "after_parties", name: "After Parties", flavour: "The party continues at camp.", req: "Campsites next to stages with Electronic, Hip Hop or Rock artist", benefit: "+3 tickets/artist" },
  { id: "jamming_sessions", name: "Jamming Sessions", flavour: "Food and music together.", req: "Catering next to stages with Rock, Funk or Hip Hop artist", benefit: "+3 tickets/artist" },
  { id: "popular_taste", name: "Popular Taste", flavour: "Crowd pleasers near the food.", req: "Catering next to stages with Electronic, Pop or Indie artist", benefit: "+3 tickets/artist" },
  { id: "bed_for_everyone", name: "A Bed for Everyone", flavour: "Campers love these genres.", req: "Campsites next to stages with Pop, Indie or Funk artist", benefit: "+3 tickets/artist" },
];

const ALL_EVENTS = [
  // Positive events
  { name: "Album Release", color: "green", desc: "A random artist has released an album.", cond: "played_artist", result: "+3 ticket sales", apply: () => ({ tickets: 3 }) },
  { name: "Food Glorious Food", color: "green", desc: "People really love the food!", cond: "has_catering", result: "+2 ticket sales", apply: () => ({ tickets: 2 }) },
  { name: "Legendary Guitar Solo", color: "green", desc: "A rock/indie/funk artist was a huge hit.", cond: "has_rock_indie_funk", result: "+1 Fame", apply: () => ({ fame: 1 }) },
  { name: "Sunny Weekend", color: "green", desc: "The good weather brings more sales.", cond: null, result: "+2 ticket sales", apply: () => ({ tickets: 2 }) },
  { name: "Trending Artist", color: "green", desc: "One of your headliners is surprisingly popular.", cond: "has_headliner", result: "+3 ticket sales", apply: () => ({ tickets: 3 }) },
  { name: "Happy Campers", color: "green", desc: "More people in your campsites this year.", cond: null, result: "+1 ticket per campsite", apply: (pd) => ({ tickets: (pd.amenities||[]).filter(a=>a.type==="campsite").length }) },
  { name: "It's Lit", color: "green", desc: "Spectacular stage lighting!", cond: "has_headliner", result: "+1 VP", apply: () => ({ vp: 1 }) },
  { name: "Going Mainstream", color: "green", desc: "A pop/hip-hop/electronic artist nailed their set.", cond: "has_pop_hiphop_electronic", result: "+1 Fame", apply: () => ({ fame: 1 }) },
  { name: "Pop Idols", color: "green", desc: "A pop headliner had a legendary performance.", cond: "has_pop_headliner", result: "+3 VP", apply: () => ({ vp: 3 }) },
  { name: "We Built This City…", color: "green", desc: "A rock headliner had a legendary performance.", cond: "has_rock_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Diss Track", color: "green", desc: "A hip-hop headliner took down another artist.", cond: "has_hiphop_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Unsigned Heroes", color: "green", desc: "An indie headliner had a legendary performance.", cond: "has_indie_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Funked it Up", color: "green", desc: "A funk headliner had a legendary performance.", cond: "has_funk_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Beat Drop", color: "green", desc: "An electronic headliner had a legendary performance.", cond: "has_electronic_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Special Requests", color: "green", desc: "A special guest lit the stage up.", cond: "has_special_guest", result: "+4 VP", apply: () => ({ vp: 4 }) },
  { name: "Sanitation Nation", color: "green", desc: "People loved the new toilets.", cond: "has_portaloo", result: "+1 ticket sale", apply: () => ({ tickets: 1 }) },
  { name: "We Are Your Friends", color: "green", desc: "The council were nice this year.", cond: "majority_councils_active", result: "+1 VP per council", apply: (pd, ctx) => ({ vp: ctx?.activeCouncilCount || 0 }) },
  { name: "Hired Muscle", color: "green", desc: "Your new security showed professionalism.", cond: "has_security", result: "+1 ticket sale", apply: () => ({ tickets: 1 }) },
  { name: "Fully Erect", color: "green", desc: "Your new campsites were popular.", cond: "has_campsite", result: "+1 ticket sale", apply: () => ({ tickets: 1 }) },
  { name: "Bartenders with Flair", color: "green", desc: "Your catering vans juggle cocktail shakers.", cond: "catering_near_stage", result: "+1 VP/catering next to stage", apply: (pd) => { const stages = pd.stages||[]; const cats = (pd.amenities||[]).filter(a=>a.type==="catering"); let count = 0; cats.forEach(c => { if (stages.some(s => { const sh = getStageHexes(s.col,s.row); return sh.some(h => areAdjacent(h.col,h.row,c.col,c.row)); })) count++; }); return { vp: count }; } },
  { name: "On their Best Behaviour", color: "green", desc: "Festival-goers were surprisingly nice.", cond: "security_per_stage", result: "+1 VP/pair of security and stage", apply: (pd) => ({ vp: Math.min((pd.stages||[]).length, (pd.amenities||[]).filter(a=>a.type==="security").length) }) },
  { name: "Rain Dancing", color: "green", desc: "Festival goers didn't mind the heavy rain.", cond: "has_stage", result: "+5 tickets", apply: () => ({ tickets: 5 }) },
  { name: "Hidden in Plain Sight", color: "green", desc: "A new artist was discovered at your festival.", cond: "has_stage", result: "Draw 1 artist from deck", apply: () => ({ drawArtist: 1 }) },
  { name: "Zero to Hero", color: "green", desc: "Your gamble on a 0 Fame artist really paid off.", cond: "has_zero_fame_headliner", result: "+5 VP, +9 tickets", apply: () => ({ vp: 5, tickets: 9 }) },
  { name: "Playing the Game", color: "green", desc: "The council are pleased with your festival.", cond: "has_active_council", result: "Draw 1 council objective", apply: () => ({ drawCouncil: 1 }) },
  { name: "Friend of a Friend", color: "green", desc: "An artist at your festival introduced you to another.", cond: "played_artist", result: "Draw 1 artist from deck", apply: () => ({ drawArtist: 1 }) },
  // Negative events — all avoidable with security
  { name: "Blocked Toilets", color: "red", desc: "One of your portaloos backs up.", cond: "has_more_than_1_portaloo", result: "Lose 1 portaloo", avoidable: true, apply: () => ({ removeAmenity: "portaloo" }) },
  { name: "Food Poisoning", color: "red", desc: "Your food vans served medium rare chicken.", cond: null, result: "Lose 1 catering or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="catering"); return c.length > 0 ? { removeAmenity: "catering" } : { fame: -1 }; } },
  { name: "Powerful Gusts", color: "red", desc: "Campsites on a hill get battered.", cond: "campsite_above_stage", result: "Lose 1 campsite or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="campsite"); return c.length > 0 ? { removeAmenity: "campsite" } : { fame: -1 }; } },
  { name: "Flooding", color: "red", desc: "Campers in the valley wake up in a bog.", cond: "campsite_below_stage", result: "Lose 1 campsite or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="campsite"); return c.length > 0 ? { removeAmenity: "campsite" } : { fame: -1 }; } },
  { name: "Speakers on Fire", color: "red", desc: "A speaker stops working during a set.", cond: null, result: "Lose half tickets of 1 artist or -1 Fame", avoidable: true, apply: (pd) => { const arts = (pd.stageArtists||[]).flat(); if (arts.length > 0) { const a = arts[Math.floor(Math.random()*arts.length)]; return { tickets: -Math.floor(a.tickets/2) }; } return { fame: -1 }; } },
  { name: "Thieves Among Us", color: "red", desc: "Campers complain about lost earrings.", cond: "campsites_gt_security", result: "-2 tickets", avoidable: true, apply: () => ({ tickets: -2 }) },
  { name: "TED Talk on Stage", color: "red", desc: "A headliner uses their set for politics.", cond: "has_headliner", result: "-2 tickets", avoidable: true, apply: () => ({ tickets: -2 }) },
  { name: "Rowdy Crowd", color: "red", desc: "A fight erupted in the crowd.", cond: null, result: "-2 tickets per act", avoidable: true, apply: (pd) => ({ tickets: -(pd.stageArtists||[]).flat().length * 2 }) },
  { name: "Passed Out", color: "red", desc: "Someone fainted in the crowd.", cond: "less_than_2_security", result: "-1 ticket", avoidable: true, apply: () => ({ tickets: -1 }) },
  { name: "Dehydration", color: "red", desc: "Long water queues.", cond: "has_catering", result: "Lose 1 distant catering", avoidable: true, apply: (pd) => { const cats = (pd.amenities||[]).filter(a=>a.type==="catering"); const stages = pd.stages||[]; const distant = cats.find(c => stages.every(s => hexDistance(c.col,c.row,s.col,s.row) > 4)); return distant ? { removeAmenity: "catering" } : {}; } },
  { name: "Shakey Ground", color: "red", desc: "Some campsites weren't built on soft enough soil.", cond: "has_campsite", result: "Lose 1 campsite", avoidable: true, apply: () => ({ removeAmenity: "campsite" }) },
  { name: "Dodgy Dealings", color: "red", desc: "Some security guards weren't here to work.", cond: "has_security", result: "Lose 1 security but +5 tickets", avoidable: true, apply: () => ({ removeAmenity: "security", tickets: 5 }) },
  { name: "Broken Walkie-Talkies", color: "red", desc: "Security guards couldn't hear each other.", cond: "has_security", result: "Lose 1 security", avoidable: true, apply: () => ({ removeAmenity: "security" }) },
  { name: "Desperate", color: "red", desc: "Festival goers couldn't make it to the toilet in time.", cond: "has_portaloo", result: "-5 tickets if portaloos < stages", avoidable: true, apply: (pd) => { const p = (pd.amenities||[]).filter(a=>a.type==="portaloo").length; const s = (pd.stages||[]).length; return p < s ? { tickets: -5 } : {}; } },
  { name: "Long Queues", color: "red", desc: "Demand was too high for catering.", cond: "has_catering", result: "-5 tickets if catering < stages", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="catering").length; const s = (pd.stages||[]).length; return c < s ? { tickets: -5 } : {}; } },
  { name: "If You Gotta Go...", color: "red", desc: "Demand was too high for portaloos.", cond: "has_portaloo", result: "Lose 1 portaloo if <10 tickets per portaloo", avoidable: true, apply: (pd) => { const p = (pd.amenities||[]).filter(a=>a.type==="portaloo").length; return p > 0 && (pd.tickets||0)/p < 10 ? { removeAmenity: "portaloo" } : {}; } },
  { name: "Overstocking", color: "red", desc: "Catering companies complained about sales.", cond: "has_catering", result: "Lose 1 catering if more catering than stages", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="catering").length; const s = (pd.stages||[]).length; return c > s ? { removeAmenity: "catering" } : {}; } },
];
/** Check if an event's condition is met for a player */
function eventConditionMet(evt, pd) {
  if (!evt.cond) return true;
  const sa = (pd.stageArtists || []), allA = sa.flat(), am = pd.amenities || [];
  const cnt = (t) => am.filter(a => a.type === t).length;
  const hasGenre = (g) => allA.some(a => getGenres(a.genre).includes(g));
  const hasGenreHL = (g) => sa.some(s => s.length === 3 && getGenres(s[2].genre).includes(g));
  switch (evt.cond) {
    case "played_artist": return allA.length > 0;
    case "has_catering": return cnt("catering") > 0;
    case "has_headliner": return sa.some(s => s.length === 3);
    case "has_stage": return (pd.stages||[]).length > 0;
    case "has_rock_indie_funk": return hasGenre("Rock") || hasGenre("Indie") || hasGenre("Funk");
    case "has_pop_hiphop_electronic": return hasGenre("Pop") || hasGenre("Hip Hop") || hasGenre("Electronic");
    case "has_pop_headliner": return hasGenreHL("Pop");
    case "has_rock_headliner": return hasGenreHL("Rock");
    case "has_hiphop_headliner": return hasGenreHL("Hip Hop");
    case "has_indie_headliner": return hasGenreHL("Indie");
    case "has_funk_headliner": return hasGenreHL("Funk");
    case "has_electronic_headliner": return hasGenreHL("Electronic");
    case "has_special_guest": return allA.some(a => a.isSpecialGuest);
    case "has_portaloo": return cnt("portaloo") > 0;
    case "has_security": return cnt("security") > 0;
    case "has_campsite": return cnt("campsite") > 0;
    case "majority_councils_active": return true; // checked in apply via ctx
    case "catering_near_stage": return (pd.stages||[]).some(st => { const sh = getStageHexes(st.col,st.row); return am.some(a => a.type==="catering" && sh.some(h => areAdjacent(a.col,a.row,h.col,h.row))); });
    case "security_per_stage": return (pd.stages||[]).length > 0 && (pd.stages||[]).every(st => { const sh = getStageHexes(st.col,st.row); return am.filter(a => a.type==="security" && sh.some(h => areAdjacent(a.col,a.row,h.col,h.row))).length >= 1; });
    case "campsite_above_stage": return am.some(a => a.type==="campsite" && (pd.stages||[]).some(s => a.row < s.row));
    case "campsite_below_stage": return am.some(a => a.type==="campsite" && (pd.stages||[]).some(s => a.row > s.row));
    case "campsites_gt_security": return cnt("campsite") > cnt("security");
    case "less_than_4_security": return cnt("security") < 4;
    case "has_hand": return (pd.hand||[]).length > 0;
    case "catering_lt_stages": return cnt("catering") < (pd.stages||[]).length;
    case "portaloo_overloaded": return cnt("portaloo") > 0 && (pd.tickets||0) / Math.max(1, cnt("portaloo")) < 10;
    case "has_more_than_1_portaloo": return cnt("portaloo") > 1;
    case "less_than_2_security": return cnt("security") < 2;
    case "has_zero_fame_headliner": return sa.some(s => s.length === 3 && s[2].fame === 0);
    case "has_active_council": return true; // checked dynamically
    default: return true;
  }
}

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hexToPixel(c, r) { const w = Math.sqrt(3) * HEX_SIZE; const h = 2 * HEX_SIZE; return { x: c * w + (r % 2 === 1 ? w / 2 : 0) + w / 2 + 4, y: r * (h * 0.75) + h / 2 + 4 }; }
function hexPoints(cx, cy, s) { const p = []; for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i - 30); p.push(`${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`); } return p.join(" "); }
function getStageHexes(cc, cr) {
  const n = cr % 2 === 0 ? [[-1,-1],[0,-1],[-1,0],[1,0],[-1,1],[0,1]] : [[0,-1],[1,-1],[-1,0],[1,0],[0,1],[1,1]];
  const h = [{ col: cc, row: cr }]; for (const [dc, dr] of n) h.push({ col: cc + dc, row: cr + dr });
  return h.filter(x => x.col >= 0 && x.col < GRID_COLS && x.row >= 0 && x.row < GRID_ROWS);
}
function stageFullyInBounds(c, r) { const h = getStageHexes(c, r); return h.length === 7 && h.every(x => x.col >= 0 && x.col < GRID_COLS && x.row >= 0 && x.row < GRID_ROWS); }
function stageWouldOverlap(c, r, stages) { const nh = getStageHexes(c, r); for (const s of stages) { const eh = getStageHexes(s.col, s.row); for (const a of nh) for (const b of eh) if (a.col === b.col && a.row === b.row) return true; } return false; }
function isOnStage(c, r, stages) { for (const s of stages) { if (getStageHexes(s.col, s.row).some(h => h.col === c && h.row === r)) return true; } return false; }
function rollDice() { return shuffle([...DICE_OPTIONS]).slice(0, 5); }
function diceNeedReroll(dice) { if (dice.length < 3) return true; const faces = new Set(dice); return faces.size === 1; }
function getGenres(genre) { return genre.split(",").map(g => g.trim()); }

/** Get hex neighbours of a given hex */
function getHexNeighbours(col, row) {
  const n = row % 2 === 0 ? [[-1,-1],[0,-1],[-1,0],[1,0],[-1,1],[0,1]] : [[0,-1],[1,-1],[-1,0],[1,0],[0,1],[1,1]];
  return n.map(([dc,dr]) => ({ col: col+dc, row: row+dr })).filter(h => h.col >= 0 && h.col < GRID_COLS && h.row >= 0 && h.row < GRID_ROWS);
}

/** Check if a hex is on the outer edge of the grid */
function isEdgeHex(col, row) { return col === 0 || col === GRID_COLS - 1 || row === 0 || row === GRID_ROWS - 1; }

/** Check if two hexes are adjacent */
function areAdjacent(c1, r1, c2, r2) {
  return getHexNeighbours(c1, r1).some(h => h.col === c2 && h.row === r2);
}

/** Hex distance (axial) */
function hexDistance(c1, r1, c2, r2) {
  // Convert offset to cube coords
  const toCube = (c, r) => { const x = c - (r - (r & 1)) / 2; const z = r; const y = -x - z; return { x, y, z }; };
  const a = toCube(c1, r1), b = toCube(c2, r2);
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

/** Evaluate council objective benefit — always active, counts qualifying amenities */
function evalCouncilObjective(obj, pd, isTrending) {
  const am = pd.amenities || [];
  const stages = pd.stages || [];
  const sa = pd.stageArtists || [];
  const ofType = (t) => am.filter(a => a.type === t);
  const cnt = (t) => ofType(t).length;
  let count = 0;
  let tickets = 0;

  const stageAdj = (a) => stages.some(s => getStageHexes(s.col, s.row).some(h => areAdjacent(a.col, a.row, h.col, h.row)));
  const countGenresOnAdjStages = (a, genres) => {
    let c = 0;
    stages.forEach((s, si) => {
      const sh = getStageHexes(s.col, s.row);
      if (sh.some(h => areAdjacent(a.col, a.row, h.col, h.row))) {
        (sa[si] || []).forEach(art => { if (genres.some(g => getGenres(art.genre).includes(g))) c++; });
      }
    });
    return c;
  };
  const isBetweenStages = (a) => {
    if (stages.length < 2) return false;
    for (let i = 0; i < stages.length; i++) {
      for (let j = i+1; j < stages.length; j++) {
        const d1 = hexDistance(a.col, a.row, stages[i].col, stages[i].row);
        const d2 = hexDistance(a.col, a.row, stages[j].col, stages[j].row);
        const ds = hexDistance(stages[i].col, stages[i].row, stages[j].col, stages[j].row);
        if (d1 < ds && d2 < ds) return true;
      }
    }
    return false;
  };

  switch (obj.id) {
    case "glamping": {
      const gc = ofType("campsite"); const gs = ofType("security"); const gp = ofType("portaloo");
      const uC = new Set(); const uS = new Set(); const uP = new Set();
      for (const c of gc) { if (uC.has(`${c.col},${c.row}`)) continue; for (const s of gs) { if (uS.has(`${s.col},${s.row}`)) continue; if (!areAdjacent(c.col,c.row,s.col,s.row)) continue; for (const p of gp) { if (uP.has(`${p.col},${p.row}`)) continue; if (areAdjacent(p.col,p.row,c.col,c.row) || areAdjacent(p.col,p.row,s.col,s.row)) { count++; uC.add(`${c.col},${c.row}`); uS.add(`${s.col},${s.row}`); uP.add(`${p.col},${p.row}`); break; } } if (uC.has(`${c.col},${c.row}`)) break; } }
      tickets = count * 7; break;
    }
    case "put_a_lid": count = ofType("campsite").filter(c => ofType("portaloo").some(p => hexDistance(c.col,c.row,p.col,p.row) === 2)).length; tickets = count * 5; break;
    case "quiet_camping": count = ofType("campsite").filter(c => stages.length === 0 || stages.every(s => hexDistance(c.col,c.row,s.col,s.row) >= 3)).length; tickets = count * 2; break;
    case "eat_local": count = ofType("campsite").filter(c => ofType("catering").some(f => areAdjacent(c.col,c.row,f.col,f.row))).length; tickets = count * 3; break;
    case "party_animals": count = ofType("campsite").filter(c => isBetweenStages(c)).length; tickets = count * 3; break;
    case "good_nights_sleep": {
      const camps = ofType("campsite"); const used = new Set();
      for (const c of camps) { if (used.has(`${c.col},${c.row}`)) continue; for (const o of camps) { if (c===o || used.has(`${o.col},${o.row}`)) continue; if (hexDistance(c.col,c.row,o.col,o.row) === 2) { count++; used.add(`${c.col},${c.row}`); used.add(`${o.col},${o.row}`); break; } } }
      tickets = count * 4; break;
    }
    case "well_rested": if (cnt("campsite") > stages.length) { count = cnt("campsite"); tickets = count * 2; } break;
    case "we_came_to_party": if (cnt("campsite") < stages.length) { count = cnt("campsite"); tickets = count * 3; } break;
    case "camp_kitchens": if (cnt("campsite") > cnt("catering")) { count = cnt("campsite"); tickets = count * 2; } break;
    case "his_and_hers": { const p = cnt("portaloo"); if (p > 0 && p % 2 === 0) { count = p / 2; tickets = count * 4; } break; }
    case "urinal_cakes": if (cnt("portaloo") > cnt("catering")) { count = cnt("portaloo"); tickets = count * 3; } break;
    case "in_n_out": count = ofType("portaloo").filter(p => ofType("catering").some(c => hexDistance(p.col,p.row,c.col,c.row) === 2)).length; tickets = count * 6; break;
    case "vipee_areas": count = ofType("portaloo").filter(p => ofType("security").some(s => hexDistance(p.col,p.row,s.col,s.row) <= 2)).length; tickets = count * 6; break;
    case "number_one_fans": { ofType("portaloo").filter(p => stageAdj(p)).forEach(p => { count += countGenresOnAdjStages(p, ["Pop","Indie","Rock"]); }); tickets = count * 3; break; }
    case "funky_smells": { ofType("portaloo").filter(p => stageAdj(p)).forEach(p => { count += countGenresOnAdjStages(p, ["Electronic","Funk","Hip Hop"]); }); tickets = count * 3; break; }
    case "neighbourhood_watch": if (cnt("security") > cnt("campsite")) { count = cnt("security"); tickets = count * 2; } break;
    case "organised_fun": if (cnt("security") > stages.length) { count = cnt("security"); tickets = count * 3; } break;
    case "shepherds": count = ofType("security").filter(s => isBetweenStages(s)).length; tickets = count * 2; break;
    case "barrier_hoppers": count = ofType("security").filter(s => isEdgeHex(s.col,s.row)).length; tickets = count * 3; break;
    case "no_wristband": {
      // Count unique campsite-stage pairs that have at least one security between them
      const usedPairs = new Set();
      ofType("campsite").forEach(c => {
        stages.forEach((st, si) => {
          const pairKey = `${c.col},${c.row}-${si}`;
          if (usedPairs.has(pairKey)) return;
          const cs = hexDistance(c.col, c.row, st.col, st.row);
          if (cs < 2) return; // need room for security between
          const hasSec = ofType("security").some(s => {
            const dc = hexDistance(s.col, s.row, c.col, c.row);
            const ds = hexDistance(s.col, s.row, st.col, st.row);
            return dc < cs && ds < cs && dc + ds <= cs + 1;
          });
          if (hasSec) { count++; usedPairs.add(pairKey); }
        });
      });
      tickets = count * 5; break;
    }
    case "secret_herbs": count = ofType("security").filter(s => ofType("catering").some(c => areAdjacent(s.col,s.row,c.col,c.row))).length; tickets = count * 6; break;
    case "sniffer_dogs": {
      const secs = ofType("security"); const used = new Set();
      for (const s of secs) { if (used.has(`${s.col},${s.row}`)) continue; for (const o of secs) { if (s===o || used.has(`${o.col},${o.row}`)) continue; if (hexDistance(s.col,s.row,o.col,o.row) === 2) { count++; used.add(`${s.col},${s.row}`); used.add(`${o.col},${o.row}`); break; } } }
      tickets = count * 6; break;
    }
    case "entourage": { ofType("security").filter(s => stageAdj(s)).forEach(s => { count += countGenresOnAdjStages(s, ["Pop","Hip Hop","Funk"]); }); tickets = count * 3; break; }
    case "bass_to_face": { ofType("security").filter(s => stageAdj(s)).forEach(s => { count += countGenresOnAdjStages(s, ["Indie","Rock","Electronic"]); }); tickets = count * 3; break; }
    case "muscle_food": if (cnt("security") > cnt("catering")) { count = cnt("security"); tickets = count * 2; } break;
    case "stage_sandwich": count = ofType("catering").filter(c => { if (stages.length < 2) return false; for (let i=0;i<stages.length;i++) { for (let j=i+1;j<stages.length;j++) { if (hexDistance(c.col,c.row,stages[i].col,stages[i].row)<=3 && hexDistance(c.col,c.row,stages[j].col,stages[j].row)<=3) return true; } } return false; }).length; tickets = count * 3; break;
    case "hydration_stations": if (cnt("catering") > cnt("campsite")) { count = cnt("catering"); tickets = count * 3; } break;
    case "food_festival": if (cnt("catering") > stages.length) { count = cnt("catering"); tickets = count * 3; } break;
    case "healthy_clientele": count = ofType("catering").filter(c => ofType("campsite").filter(ca => areAdjacent(c.col,c.row,ca.col,ca.row)).length >= 2).length; tickets = count * 9; break;
    case "liquid_lunches": count = ofType("catering").filter(c => ofType("portaloo").filter(p => areAdjacent(c.col,c.row,p.col,p.row)).length >= 2).length; tickets = count * 9; break;
    case "beef": {
      const cats = ofType("catering"); const used = new Set();
      for (const c of cats) { if (used.has(`${c.col},${c.row}`)) continue; for (const o of cats) { if (c===o || used.has(`${o.col},${o.row}`)) continue; if (hexDistance(c.col,c.row,o.col,o.row) === 3) { count++; used.add(`${c.col},${c.row}`); used.add(`${o.col},${o.row}`); break; } } }
      tickets = count * 6; break;
    }
    case "after_parties": { ofType("campsite").filter(c => stageAdj(c)).forEach(c => { count += countGenresOnAdjStages(c, ["Electronic","Hip Hop","Rock"]); }); tickets = count * 3; break; }
    case "jamming_sessions": { ofType("catering").filter(c => stageAdj(c)).forEach(c => { count += countGenresOnAdjStages(c, ["Rock","Funk","Hip Hop"]); }); tickets = count * 3; break; }
    case "popular_taste": { ofType("catering").filter(c => stageAdj(c)).forEach(c => { count += countGenresOnAdjStages(c, ["Electronic","Pop","Indie"]); }); tickets = count * 3; break; }
    case "bed_for_everyone": { ofType("campsite").filter(c => stageAdj(c)).forEach(c => { count += countGenresOnAdjStages(c, ["Pop","Indie","Funk"]); }); tickets = count * 3; break; }
    default: break;
  }

  const r = { active: true, tickets, vp: 0, fame: 0, count };
  if (isTrending) { r.tickets = 0; r.fame = count > 0 ? 1 : 0; }
  return r;
}

function isCouncilActive(obj, pd) { return true; }
function calcCouncilBenefit(obj, pd, isTrending) { const r = evalCouncilObjective(obj, pd, isTrending); return { tickets: r.tickets, vp: r.vp, fame: r.fame }; }
function genreGradient(genre) {
  const gs = getGenres(genre);
  if (gs.length === 1) return GENRE_COLORS[gs[0]] || "#6b7280";
  return `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)`;
}
function canAffordArtist(artist, pd) {
  if (pd.fame < artist.fame) return false;
  const counts = { campsite: 0, security: 0, catering: 0, portaloo: 0 };
  pd.amenities.forEach(a => counts[a.type]++);
  return counts.campsite >= artist.campCost && counts.security >= artist.securityCost && counts.catering >= artist.cateringCost && counts.portaloo >= artist.portalooCost;
}
function getAvailableStages(pd) {
  return pd.stages.filter((_, i) => (pd.stageArtists?.[i] || []).length < 3);
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════
function HexGrid({ stages, amenities, onHexClick, placingStage, hoverHex, onHexHover, movingFrom, stageColors, onCenterClick }) {
  const w = Math.sqrt(3) * HEX_SIZE, h = 2 * HEX_SIZE;
  const svgW = GRID_COLS * w + w / 2 + 8, svgH = GRID_ROWS * (h * 0.75) + h * 0.25 + 8;
  // Map each hex to its stage index for coloring
  const hexStageMap = useMemo(() => {
    const m = {};
    stages.forEach((st, si) => getStageHexes(st.col, st.row).forEach(x => { m[`${x.col},${x.row}`] = si; }));
    return m;
  }, [stages]);
  const centerSet = useMemo(() => new Set(stages.map(s => `${s.col},${s.row}`)), [stages]);
  const amenMap = useMemo(() => { const m = {}; amenities.forEach(a => m[`${a.col},${a.row}`] = a); return m; }, [amenities]);
  let prevHexes = []; if (placingStage && hoverHex && stageFullyInBounds(hoverHex.col, hoverHex.row)) prevHexes = getStageHexes(hoverHex.col, hoverHex.row);
  const prevSet = new Set(prevHexes.map(h => `${h.col},${h.row}`));
  const sc = stageColors || [];
  const els = [];
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) {
    const { x, y } = hexToPixel(c, r); const k = `${c},${r}`;
    const si = hexStageMap[k]; const isSt = si !== undefined; const isCtr = centerSet.has(k);
    const am = amenMap[k]; const isPv = prevSet.has(k);
    const isMF = movingFrom && movingFrom.col === c && movingFrom.row === r;
    const baseColor = isSt && sc[si] ? sc[si] : "#7c3aed";
    let fill = "#1a1a2e", stroke = "#2a2a4a", sw = 1, op = 1;
    if (isSt) { fill = baseColor + "30"; stroke = baseColor; sw = 1.5; }
    if (isCtr) { fill = baseColor + "60"; stroke = baseColor; sw = 2; }
    if (isPv) { fill = "#4c1d95"; stroke = "#c4b5fd"; sw = 2; op = 0.7; }
    if (isMF) { fill = "#92400e"; stroke = "#fbbf24"; sw = 2; }
    els.push(<g key={k} onClick={() => { if (isCtr && onCenterClick) { onCenterClick(si); } else { onHexClick?.(c, r); } }} onMouseEnter={() => onHexHover?.({ col: c, row: r })} onMouseLeave={() => onHexHover?.(null)} style={{ cursor: "pointer" }}>
      <polygon points={hexPoints(x, y, HEX_SIZE)} fill={fill} stroke={stroke} strokeWidth={sw} opacity={op} />
      {isCtr && <text x={x} y={y + 3} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">🎤</text>}
      {am && !isMF && <text x={x} y={y + 6} textAnchor="middle" fontSize="18">{AMENITY_ICONS[am.type]}</text>}
    </g>);
  }
  return <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: "100%", maxHeight: "100%" }}><rect width={svgW} height={svgH} fill="transparent" />{els}</svg>;
}

function ArtistCard({ artist, onClick, small, disabled, selected, showCost, affordable }) {
  const gs = getGenres(artist.genre);
  const bg = gs.length === 1 ? GENRE_COLORS[gs[0]] || "#6b7280" : null;
  const grad = gs.length > 1 ? `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)` : undefined;
  const sz = small ? { width: 140, minHeight: 100, padding: "8px 10px", fontSize: 12 } : { width: 170, minHeight: 140, padding: "10px 12px", fontSize: 13 };
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      ...sz, borderRadius: 12, border: selected ? "2px solid #fbbf24" : affordable ? "2px solid rgba(251,191,36,0.5)" : "2px solid rgba(255,255,255,0.15)",
      background: grad || bg, color: "#fff", cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, display: "flex", flexDirection: "column", gap: 3,
      position: "relative", overflow: "hidden", transition: "all 0.15s", flexShrink: 0,
      boxShadow: selected ? "0 0 12px rgba(251,191,36,0.4)" : "0 2px 8px rgba(0,0,0,0.3)",
      animation: affordable && !disabled && !selected ? "affordPulse 2s ease-in-out infinite" : "none",
    }}>
      <div style={{ fontWeight: 800, fontSize: small ? 12 : 14, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{artist.name}</div>
      <div style={{ fontSize: small ? 10 : 11, opacity: 0.9 }}>🔥{artist.fame} • {artist.genre}</div>
      <div style={{ fontSize: small ? 10 : 11, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span>🎟️{artist.tickets}</span><span>⭐{artist.vp}VP</span>
      </div>
      {showCost && <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
        {artist.campCost > 0 && <span>⛺{artist.campCost} </span>}
        {artist.securityCost > 0 && <span>👮‍♀️{artist.securityCost} </span>}
        {artist.cateringCost > 0 && <span>🍔{artist.cateringCost} </span>}
        {artist.portalooCost > 0 && <span>🚽{artist.portalooCost}</span>}
      </div>}
      {artist.effect && <div style={{ fontSize: small ? 9 : 10, fontStyle: "italic", opacity: 0.9, marginTop: "auto", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>✨ {artist.effect}</div>}
    </div>
  );
}

function DiceDisplay({ dice, onPick, disabled, onReroll, canReroll }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
      {dice.map((d, i) => {
        const isC = d === "catering_or_portaloo" || d === "security_or_campsite";
        const isFame = d === "fame";
        const label = isFame ? "🔥" : isC ? (d === "catering_or_portaloo" ? "🍔 OR 🚽" : "👮‍♀️ OR ⛺") : AMENITY_ICONS[d];
        const sub = isFame ? "Fame" : isC ? (d === "catering_or_portaloo" ? "Van / Loo" : "Sec / Camp") : AMENITY_LABELS[d];
        return <button key={i} onClick={() => !disabled && onPick(i, d)} disabled={disabled} style={{
          width: 72, height: 80, borderRadius: 12, border: isFame ? "2px solid #fbbf24" : "2px solid #7c3aed",
          background: isFame ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)", color: isFame ? "#fbbf24" : "#e9d5ff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 2, cursor: disabled ? "default" : "pointer", fontSize: 22,
          opacity: disabled ? 0.4 : 1, transition: "all 0.2s",
        }}><span>{label}</span><span style={{ fontSize: 9, opacity: 0.8 }}>{sub}</span></button>;
      })}
      {canReroll && <button onClick={onReroll} style={{
        width: 72, height: 80, borderRadius: 12, border: "2px dashed #fbbf24",
        background: "rgba(251,191,36,0.15)", color: "#fbbf24",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 14, fontWeight: 700, gap: 2,
      }}>🔄<span style={{ fontSize: 9 }}>Reroll All</span></button>}
    </div>
  );
}

function DiceRollOverlay({ pendingRoll, onRoll, onComplete, sfx }) {
  const [rolling, setRolling] = useState(false);
  const [animFrames, setAnimFrames] = useState([]);
  const [finalResults, setFinalResults] = useState(null);

  const doRoll = () => {
    if (rolling) return;
    setRolling(true);
    sfx?.placeAmenity();
    // Animate 6 frames of random dice, then settle
    let frame = 0;
    const iv = setInterval(() => {
      setAnimFrames(shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count));
      frame++;
      if (frame >= 8) {
        clearInterval(iv);
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count);
        setFinalResults(results);
        setAnimFrames([]);
        setRolling(false);
        onRoll(results);
      }
    }, 120);
  };

  const display = finalResults || (rolling ? animFrames : null);
  const diceLabel = (d) => {
    if (d === "fame") return "🔥";
    if (d === "catering_or_portaloo") return "🍔/🚽";
    if (d === "security_or_campsite") return "👮‍♀️/⛺";
    return AMENITY_ICONS[d] || d;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 500, width: "100%", border: "2px solid #7c3aed", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
        <div style={{ fontSize: 16, color: "#c4b5fd", marginBottom: 4 }}>{pendingRoll.artistName}</div>
        <h2 style={{ color: "#fbbf24", fontSize: 24, margin: "0 0 16px" }}>🎲 Roll {pendingRoll.count} Dice!</h2>
        {!display && <button onClick={doRoll} style={{
          padding: "16px 40px", borderRadius: 14, border: "2px solid #fbbf24",
          background: "linear-gradient(135deg, #422006, #713f12)", color: "#fbbf24",
          fontSize: 20, fontWeight: 800, cursor: "pointer",
          animation: "pulse 1.5s infinite",
        }}>🎲 ROLL!</button>}
        {display && <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {display.map((d, i) => <div key={i} style={{
            width: 64, height: 70, borderRadius: 12,
            border: d === "fame" ? "2px solid #fbbf24" : "2px solid #7c3aed",
            background: d === "fame" ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
            color: d === "fame" ? "#fbbf24" : "#e9d5ff",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontSize: 24, transition: rolling ? "none" : "all 0.3s",
            transform: rolling ? `rotate(${Math.random() * 20 - 10}deg)` : "none",
          }}><span>{diceLabel(d)}</span></div>)}
        </div>}
        {finalResults && !rolling && <>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{typeof pendingRoll.resultText === "function" ? pendingRoll.resultText(finalResults) : (pendingRoll.resultText || "")}</div>
          <button onClick={() => onComplete(finalResults)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>Continue →</button>
        </>}
      </div>
    </div>
  );
}

function GameLog({ log, onClose }) {
  const groups = []; let cur = null;
  for (const e of log) { if (e.type === "header") { cur = { header: e, entries: [] }; groups.push(cur); } else { if (!cur) { cur = { header: null, entries: [] }; groups.push(cur); } cur.entries.push(e); } }
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#0f0e1a", borderLeft: "2px solid #7c3aed", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(124,58,237,0.3)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#c4b5fd" }}>📜 Game Log</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {groups.length === 0 && <p style={{ color: "#6b7280", fontSize: 13, padding: 8 }}>No events yet.</p>}
        {groups.map((g, i) => <div key={i} style={{ marginBottom: 16 }}>
          {g.header && <div style={{ padding: "6px 10px", marginBottom: 6, borderRadius: 8, background: g.header.ht === "year" ? "rgba(251,191,36,0.15)" : g.header.ht === "round" ? "rgba(248,113,113,0.15)" : "rgba(124,58,237,0.15)", borderLeft: `3px solid ${g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#7c3aed"}` }}>
            <span style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#c4b5fd" }}>{g.header.text}</span>
          </div>}
          {g.entries.map((e, j) => <div key={j} style={{ marginBottom: 4, marginLeft: 8, padding: "5px 10px", background: "rgba(124,58,237,0.06)", borderRadius: 6, fontSize: 12, color: "#d1d5db", borderLeft: "2px solid #3b3564" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{e.label}</span>
            <span style={{ marginLeft: 6, color: "#94a3b8" }}>{e.text}</span>
          </div>)}
        </div>)}
      </div>
    </div>
  );
}

function DiscardViewer({ discard, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f0e1a", border: "1px solid #7c3aed", borderRadius: 16, padding: 20, maxWidth: 700, maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "#c4b5fd", margin: 0 }}>🗑️ Discard Pile ({discard.length} artists)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {discard.length === 0 ? <p style={{ color: "#6b7280" }}>No discarded artists yet.</p> :
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {discard.map((a, i) => <ArtistCard key={i} artist={a} small showCost />)}
          </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI ENGINE
// ═══════════════════════════════════════════════════════════

/** Find a valid hex to place an amenity (not on stage, not occupied) */
function aiFindPlacement(pd) {
  const occupied = new Set();
  (pd.amenities || []).forEach(a => occupied.add(`${a.col},${a.row}`));
  (pd.stages || []).forEach(s => getStageHexes(s.col, s.row).forEach(h => occupied.add(`${h.col},${h.row}`)));
  // Prefer tiles near stages but not on them
  const candidates = [];
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) {
    if (!occupied.has(`${c},${r}`)) {
      let nearStage = 0;
      (pd.stages || []).forEach(s => { if (hexDistance(c, r, s.col, s.row) <= 3) nearStage++; });
      candidates.push({ col: c, row: r, score: nearStage * 10 + Math.random() * 5 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || { col: 6, row: 6 };
}

/** Find a valid stage placement position */
function aiFindStagePlacement(pd) {
  const candidates = [];
  for (let r = 2; r < GRID_ROWS - 2; r++) for (let c = 2; c < GRID_COLS - 2; c++) {
    if (stageFullyInBounds(c, r) && !stageWouldOverlap(c, r, pd.stages || [])) {
      // Prefer center-ish, away from other stages
      const distCenter = Math.abs(c - 6) + Math.abs(r - 6);
      let minStageDist = 99;
      (pd.stages || []).forEach(s => { const d = hexDistance(c, r, s.col, s.row); if (d < minStageDist) minStageDist = d; });
      candidates.push({ col: c, row: r, score: -distCenter + (minStageDist > 4 ? 10 : 0) + Math.random() * 3 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || { col: 6, row: 6 };
}

/** AI picks the best amenity type to take, considering what it needs most */
function aiPickAmenityType(pd) {
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  (pd.amenities || []).forEach(a => counts[a.type]++);
  // Priority: security for events, campsites for tickets, then balance
  const needs = [
    { type: "security", need: Math.max(0, 3 - counts.security) * 10 + Math.random() * 3 },
    { type: "campsite", need: Math.max(0, 4 - counts.campsite) * 8 + Math.random() * 3 },
    { type: "catering", need: Math.max(0, 2 - counts.catering) * 6 + Math.random() * 3 },
    { type: "portaloo", need: Math.max(0, 2 - counts.portaloo) * 5 + Math.random() * 3 },
  ];
  needs.sort((a, b) => b.need - a.need);
  return needs[0].type;
}

/** AI decides which die to pick from available dice */
function aiPickDie(dice, pd, preferredType) {
  const wanted = preferredType || aiPickAmenityType(pd);
  // Find a die that gives the wanted type
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === wanted) return { idx: i, type: wanted };
    if (dice[i] === "catering_or_portaloo" && (wanted === "catering" || wanted === "portaloo")) return { idx: i, type: wanted };
    if (dice[i] === "security_or_campsite" && (wanted === "security" || wanted === "campsite")) return { idx: i, type: wanted };
  }
  // Fallback: pick fame die if available (free fame is good)
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "fame") return { idx: i, type: "fame" };
  }
  // Fallback: pick first available
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "catering_or_portaloo") return { idx: i, type: "catering" };
    if (dice[i] === "security_or_campsite") return { idx: i, type: "security" };
    if (dice[i] !== "fame") return { idx: i, type: dice[i] };
  }
  return { idx: 0, type: dice[0] || "campsite" };
}

/** AI selects which draft artists to keep (indices) */
function aiDraftSelect(options) {
  // Prefer one low-fame (playable soon) and one high-fame (for later)
  const scored = options.map((a, i) => ({
    idx: i, score: a.vp * 2 + a.tickets * 3 + (a.effect ? 5 : 0) + (a.fame <= 1 ? 10 : 0) + Math.random() * 3
  }));
  scored.sort((a, b) => b.score - a.score);
  return [scored[0].idx, scored[1].idx];
}

/** AI decides which amenity to pick in setup */
function aiPickSetupAmenity() {
  const r = Math.random();
  if (r < 0.35) return "security";
  if (r < 0.6) return "campsite";
  if (r < 0.8) return "portaloo";
  return "catering";
}

/** AI decides what to do on its turn: returns { action, ... } */
function aiDecideTurn(pd, artistPool, dice, year) {
  const sa = pd.stageArtists || [];
  const openStages = sa.filter(s => s.length < 3);
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  (pd.amenities || []).forEach(a => counts[a.type]++);
  const totalAmenities = Object.values(counts).reduce((s, v) => s + v, 0);
  const fame = pd.fame || 0;

  // Only book from HAND (no direct pool booking)
  const bookableHand = (pd.hand || []).filter(a => counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost);
  const hasOpenStage = openStages.length > 0;

  // PRIORITY 1: Book from hand if possible
  if (bookableHand.length > 0 && hasOpenStage) {
    bookableHand.sort((x, y) => {
      const xScore = (x.vp * 3 + x.tickets * 2) + (x.effect ? 5 : 0);
      const yScore = (y.vp * 3 + y.tickets * 2) + (y.effect ? 5 : 0);
      return yScore - xScore;
    });
    const pick = bookableHand[0];
    const idx = (pd.hand || []).indexOf(pick);
    let bestStage = sa.findIndex(s => s.length === 2);
    if (bestStage < 0) bestStage = sa.findIndex(s => s.length === 1);
    if (bestStage < 0) bestStage = sa.findIndex(s => s.length === 0);
    if (bestStage < 0) bestStage = 0;
    return { action: "book", source: "hand", artistIdx: idx, stageIdx: bestStage };
  }

  // PRIORITY 2: Pick up from pool or draw from deck if hand is small
  const handSize = (pd.hand || []).length;
  if (handSize < 5) {
    if (artistPool.length > 0) {
      // Pick best from pool
      const scored = artistPool.map((a, i) => {
        let s = a.vp * 2 + a.tickets;
        if (counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost) s += 15;
        s += Math.random() * 3;
        return { i, s };
      });
      scored.sort((a, b) => b.s - a.s);
      return { action: "reserve", poolIdx: scored[0].i };
    } else {
      return { action: "drawDeck" };
    }
  }

  // PRIORITY 3: Get amenities
  const neededForArtists = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  [...(pd.hand || [])].forEach(a => {
    if (a.campCost > counts.campsite) neededForArtists.campsite++;
    if (a.securityCost > counts.security) neededForArtists.security++;
    if (a.cateringCost > counts.catering) neededForArtists.catering++;
    if (a.portalooCost > counts.portaloo) neededForArtists.portaloo++;
  });

  return { action: "amenity", preferredType: Object.entries(neededForArtists).sort((a, b) => b[1] - a[1])[0]?.[0] };
}

// ═══════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════
export default function Headliners() {
  // Phase management
  const [phase, setPhase] = useState("lobby");
  const [players, setPlayers] = useState([{ id: 0, name: "Player 1", festivalName: "", isAI: false }, { id: 1, name: "Player 2", festivalName: "", isAI: false }]);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState({});
  const [setupIndex, setSetupIndex] = useState(0);
  const [setupStep, setSetupStep] = useState("pickAmenity");
  const [setupSelectedAmenity, setSetupSelectedAmenity] = useState(null);

  // Game state
  const [year, setYear] = useState(1);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState({});
  const [dice, setDice] = useState([]);
  const [turnAction, setTurnAction] = useState(null);
  const [actionTaken, setActionTaken] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  // Goals system
  const [activeGoals, setActiveGoals] = useState([]); // [{ goal, setAsideArtists: [fame3, fame5], req2ClaimedBy: null, req3ClaimedBy: null }]
  const [goalProgress, setGoalProgress] = useState({}); // { playerId: { portalooRefreshes: 0, fameDieRolls: 0, ... } }
  const [goalReq1Claimed, setGoalReq1Claimed] = useState({}); // { goalId: { playerId: true } } — tracks who claimed req1
  const goalClaimsRef = useRef({}); // { "goalId_req2": pid, "goalId_req3": pid } — sync tracking
  const [selectedDie, setSelectedDie] = useState(null);
  const [choiceAmenity, setChoiceAmenity] = useState(null);
  const [placingAmenity, setPlacingAmenity] = useState(null);
  const [placingStage, setPlacingStage] = useState(false);
  const [movingFrom, setMovingFrom] = useState(null);
  const [movedThisTurn, setMovedThisTurn] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null); // { count, results, rolled, pid, artistName, callback }
  const [pendingPortalooRefresh, setPendingPortalooRefresh] = useState(0);
  
  // Agent system: each player has 1 agent they can deploy for free
  // agentPlacements: { pid: { type: "dice"|"pool", amenityType?: string, poolIdx?: number, artistName?: string, placedTurn?: number } | null }
  const [agentPlacements, setAgentPlacements] = useState({});
  // Tracks which players have successfully used their agent this year (exhausted until next year)
  const [agentExhausted, setAgentExhausted] = useState({});
  // Pending agent amenity placements (player needs to place amenity gained from agent)
  const [pendingAgentAmenity, setPendingAgentAmenity] = useState([]); // [{ pid, amenityType }]
  // Pending agent artist booking (uncontested pool claim)
  const [pendingAgentArtist, setPendingAgentArtist] = useState(null); // { pid, artist, poolIdx }
  // Agent contest state (multiple agents on same artist)
  const [agentContest, setAgentContest] = useState(null); // { artist, contestants: [{pid, placedTurn}], results: null } // 0=none, 1=first refresh done, 2=second refresh done
  const [hoverHex, setHoverHex] = useState(null);
  const [showTurnStart, setShowTurnStart] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [allTickets, setAllTickets] = useState({});
  const [revealIndex, setRevealIndex] = useState(0);
  const [leaderboardRevealed, setLeaderboardRevealed] = useState(false);

  // Pre-round
  const [preRoundIndex, setPreRoundIndex] = useState(0);
  const [preRoundStep, setPreRoundStep] = useState("notify");
  const [displacedAmenities, setDisplacedAmenities] = useState([]);
  const [displacedPlaceIdx, setDisplacedPlaceIdx] = useState(0);

  // Artist system
  const [artistDeck, setArtistDeck] = useState([]);
  const [artistPool, setArtistPool] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [showDiscard, setShowDiscard] = useState(false);
  const [firstFullLineup, setFirstFullLineup] = useState(false);

  // Artist action sub-states
  const [artistAction, setArtistAction] = useState(null); // "bookFromPool","bookFromHand","reserveFromPool","reserveFromDeck","pickStage"
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedStageIdx, setSelectedStageIdx] = useState(null);
  const [showHeadliner, setShowHeadliner] = useState(null); // { artist, festival }
  const [showBookedArtist, setShowBookedArtist] = useState(null); // { artist, stageName, isHeadliner, festival }
  const [floatingBonuses, setFloatingBonuses] = useState([]); // [{ id, text, color, x }]
  const [showHand, setShowHand] = useState(false);
  const [deckDrawnCard, setDeckDrawnCard] = useState(null); // card drawn from deck awaiting confirm
  const [deckCardRevealed, setDeckCardRevealed] = useState(false);
  // Draw 2 flow: player picks 2 artists from any combo of pool/deck
  const [draw2Picks, setDraw2Picks] = useState([]); // artists picked so far (0, 1, or 2)
  const [draw2DeckCard, setDraw2DeckCard] = useState(null); // deck card drawn but not yet decided

  // Setup artist draft
  const [setupDraftOptions, setSetupDraftOptions] = useState([]); // 4 cards offered to current setup player
  const [setupDraftSelected, setSetupDraftSelected] = useState(null);
  const [draftRemaining0, setDraftRemaining0] = useState([]); // pool of 0-fame artists for drafting
  const [draftRemaining5, setDraftRemaining5] = useState([]); // pool of 5-fame artists for drafting
  const [undraftedArtists, setUndraftedArtists] = useState([]); // unchosen draft cards to shuffle back

  // Objectives
  const [objectiveDeck, setObjectiveDeck] = useState([]);
  const [playerObjectives, setPlayerObjectives] = useState({}); // { playerId: objective }
  const [trendingObjective, setTrendingObjective] = useState(null);
  const [microtrends, setMicrotrends] = useState([]); // [{ genre, claimedBy: null }]
  const [trendingCouncil, setTrendingCouncil] = useState(null); // a council objective used as trending
  const trendingCouncilRef = useRef(null);
  // Keep ref in sync
  useEffect(() => { trendingCouncilRef.current = trendingCouncil; }, [trendingCouncil]);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showStageDetail, setShowStageDetail] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("my"); // "my" or "trending"
  const [showYearAnnouncement, setShowYearAnnouncement] = useState(false);

  // Council objectives
  const [councilDeck, setCouncilDeck] = useState([]);
  const [councilChoiceOptions, setCouncilChoiceOptions] = useState(null); // [obj1, obj2] when player is choosing
  const [playerCouncils, setPlayerCouncils] = useState({}); // { playerId: [{ obj, active, fameGranted }] }
  const playerCouncilsRef = useRef({});
  useEffect(() => { playerCouncilsRef.current = playerCouncils; }, [playerCouncils]);
  const [showCouncilFame, setShowCouncilFame] = useState(null); // { name, festival } for notification
  const [viewingPlayerId, setViewingPlayerId] = useState(null);

  // Pending effects queue (for effects that need player interaction)
  const [pendingEffect, setPendingEffect] = useState(null); // { type: "placeAmenity"|"placeSpecific"|"signArtist", amenityType?, artistName? }
  const [pendingEffectPid, setPendingEffectPid] = useState(null);
  const [deferPoolRefresh, setDeferPoolRefresh] = useState(false);
  const [poolRefreshedByEffect, setPoolRefreshedByEffect] = useState(false);

  // Special Guest phase
  const [specialGuestPlayer, setSpecialGuestPlayer] = useState(0); // index in players array
  const [specialGuestCard, setSpecialGuestCard] = useState(null); // the drawn artist
  const [specialGuestEligible, setSpecialGuestEligible] = useState([]); // stage indices with 2/3 artists

  // Events system
  const [eventDeck, setEventDeck] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]); // 3 drawn at year start — { event, revealed: false }
  const [playerPersonalEvents, setPlayerPersonalEvents] = useState({}); // { pid: [event] }
  const [eventPhasePlayer, setEventPhasePlayer] = useState(0);
  // Year-End Effects phase state
  const [yearEndEffectsPlayer, setYearEndEffectsPlayer] = useState(0);
  const [yearEndEffectsList, setYearEndEffectsList] = useState([]); // [{ artist, effectDesc, type, resolved, result }]
  const [yearEndEffectIdx, setYearEndEffectIdx] = useState(0);
  const [yearEndDiceRoll, setYearEndDiceRoll] = useState(null); // { count, callback } for interactive rolls
  const [eventPhaseResults, setEventPhaseResults] = useState(null);
  const [eventPhaseStep, setEventPhaseStep] = useState("delegate"); // "delegate" or "results"
  const [securityDelegation, setSecurityDelegation] = useState(0);

  // Logging
  const addLog = useCallback((label, text) => setGameLog(p => [...p, { label, text, type: "entry" }]), []);
  const addLogH = useCallback((text, ht) => setGameLog(p => [...p, { text, type: "header", ht: ht || "turn" }]), []);

  const floatCounter = useRef(0);

  // ─── Sound Effects (Web Audio API) ───
  const audioCtx = useRef(null);
  const getCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);
  const playTone = useCallback((freq, dur, type = "sine", vol = 0.15) => {
    try {
      const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }, [getCtx]);
  const sfx = useMemo(() => ({
    placeAmenity: () => { playTone(800, 0.08, "sine", 0.12); setTimeout(() => playTone(600, 0.06, "sine", 0.08), 60); },
    bookArtist: () => { playTone(523, 0.1, "triangle", 0.15); setTimeout(() => playTone(659, 0.1, "triangle", 0.15), 80); setTimeout(() => playTone(784, 0.15, "triangle", 0.12), 160); },
    headliner: () => { playTone(523, 0.1, "triangle", 0.18); setTimeout(() => playTone(659, 0.08, "triangle", 0.16), 100); setTimeout(() => playTone(784, 0.08, "triangle", 0.16), 180); setTimeout(() => playTone(1047, 0.25, "triangle", 0.2), 260); },
    gainVP: () => { playTone(880, 0.12, "sine", 0.1); setTimeout(() => playTone(1100, 0.1, "sine", 0.08), 80); },
    gainTickets: () => { playTone(660, 0.08, "square", 0.06); setTimeout(() => playTone(770, 0.1, "square", 0.05), 70); },
    gainFame: () => { playTone(440, 0.12, "sawtooth", 0.08); setTimeout(() => playTone(660, 0.15, "sawtooth", 0.1), 100); setTimeout(() => playTone(880, 0.2, "sawtooth", 0.08), 200); },
    placeStage: () => { playTone(330, 0.15, "triangle", 0.12); setTimeout(() => playTone(440, 0.12, "triangle", 0.1), 120); setTimeout(() => playTone(550, 0.2, "triangle", 0.12), 220); },
  }), [playTone]);
  const showFloatingBonus = useCallback((text, color) => {
    const id = Date.now() + Math.random();
    const offset = (floatCounter.current % 4) * 50; // stagger by 50px each
    floatCounter.current++;
    setFloatingBonuses(p => [...p, { id, text, color: color || "#fbbf24", offset }]);
    setTimeout(() => setFloatingBonuses(p => p.filter(b => b.id !== id)), 2200);
  }, []);

  // Derived
  const currentPlayerId = turnOrder[currentPlayerIdx];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPD = playerData[currentPlayerId] || {};
  const noTurnsLeft = currentPlayerId !== undefined && (turnsLeft[currentPlayerId] || 0) <= 0;

  // ─── Ticket calc ───
  /** Compute effective fame for a player: stages + council fame bonuses + artist effects, capped at 5 */
  const calcFame = useCallback((pd, councils) => {
    let f = 0; // no passive fame from stages
    // Trending council fame bonus (applies to all players)
    if (trendingCouncil) {
      const tb = evalCouncilObjective(trendingCouncil, pd, true);
      if (tb.active) f += tb.fame;
    }
    // Base fame from effects (already stored in pd.baseFame from artist effects like +1 Fame)
    f += pd.baseFame || 0;
    return Math.min(FAME_MAX, f);
  }, [trendingCouncil]);

  // Pure function: compute tickets/fame for a single player data object
  function computeTicketsForPlayer(pd, councils, trendingCouncilObj) {
    if (!pd || !pd.amenities) return pd;
    let t = pd.amenities.filter(a => a.type === "campsite").length * 2;
    (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets; }));
    t += pd.bonusTickets || 0;
    let councilTicketTotal = 0;
    (councils || []).forEach(co => {
      if (co.active) {
        const b = evalCouncilObjective(co.obj, pd, false);
        councilTicketTotal += b.tickets;
      }
    });
    t += councilTicketTotal;
    let fame = pd.baseFame || 0;
    if (trendingCouncilObj) {
      const tb = evalCouncilObjective(trendingCouncilObj, pd, true);
      if (tb.active && tb.fame > 0) fame += tb.fame;
    }
    fame += Math.floor(t / 10);
    fame = Math.min(FAME_MAX, fame);
    return { ...pd, tickets: t, rawTickets: t, fame, councilTickets: councilTicketTotal };
  }

  // Recalculate ALL players' tickets using latest state
  const recalcTickets = useCallback(() => {
    const latestCouncils = playerCouncilsRef.current || playerCouncils || {};
    const tc = trendingCouncilRef.current;
    setPlayerData(prev => {
      const next = { ...prev };
      for (const pid of Object.keys(next)) {
        next[pid] = computeTicketsForPlayer(next[pid], latestCouncils[pid] || [], tc);
      }
      return next;
    });
  }, [playerCouncils, trendingCouncil]);

  // Helper: update player data AND recalculate tickets in one atomic setPlayerData call
  // Usage: recalcAfterUpdate(pid, pd => ({ ...pd, amenities: [...pd.amenities, newAmenity] }))
  const recalcAfterUpdate = useCallback((pid, updater) => {
    const latestCouncils = playerCouncilsRef.current || playerCouncils || {};
    const tc = trendingCouncilRef.current;
    setPlayerData(prev => {
      const next = { ...prev };
      // Apply the mutation
      next[pid] = updater(next[pid]);
      // Recalc ALL players (in case effects cross players)
      for (const p of Object.keys(next)) {
        next[p] = computeTicketsForPlayer(next[p], latestCouncils[p] || [], tc);
      }
      return next;
    });
  }, [playerCouncils, trendingCouncil]);

  // ─── Deck management ───
  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  /** Check if placing security triggers Kendrick-style VP bonus */
  // ═══════════════════════════════════════════════════════════
  // AGENT SYSTEM
  // ═══════════════════════════════════════════════════════════
  const hasAgent = (pid) => !agentPlacements[pid] && !agentExhausted[pid]; // available if not deployed AND not exhausted this year
  const getAgentPlacement = (pid) => agentPlacements[pid] || null;
  
  // Place agent on pool artist — start 2-step booking claim
  const placeAgentOnArtist = (pid, poolIdx) => {
    const artist = artistPool[poolIdx];
    if (!artist) return false;
    setAgentPlacements(prev => ({ ...prev, [pid]: { type: "pool", poolIdx, artistName: artist.name, placedTurn: turnNumber } }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🕵️ Agent", `${pName} deployed agent to claim ${artist.name}`);
    return true;
  };
  
  // Return agent to player (failed/cancelled — available to redeploy this year)
  const returnAgent = (pid) => {
    setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
  };
  
  // Exhaust agent after successful use — removed until next year
  const exhaustAgent = (pid) => {
    setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setAgentExhausted(prev => ({ ...prev, [pid]: true }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🕵️ Agent", `${pName}'s agent exhausted until next year`);
  };
  
  // Track turn number for agent ordering
  const [turnNumber, setTurnNumber] = useState(0);
  
  // Resolve pool artist agents at start of a player's turn
  const resolvePoolAgents = (pid) => {
    const placement = agentPlacements[pid];
    if (!placement || placement.type !== "pool") return null;
    
    // Find the artist in the pool by name (index may have shifted)
    const poolIdx = artistPool.findIndex(a => a.name === placement.artistName);
    if (poolIdx < 0) {
      // Artist no longer in pool — agent is redundant
      returnAgent(pid);
      addLog("🕵️ Agent", `Artist ${placement.artistName} no longer available — agent returned`);
      return null;
    }
    
    const artist = artistPool[poolIdx];
    
    // Check if other agents are also on this artist
    const contestants = Object.entries(agentPlacements)
      .filter(([oPid, p]) => p && p.type === "pool" && p.artistName === placement.artistName)
      .map(([oPid, p]) => ({ pid: parseInt(oPid), placedTurn: p.placedTurn }));
    
    if (contestants.length === 1) {
      // Uncontested — player books the artist directly
      return { type: "uncontested", artist, poolIdx, pid };
    } else {
      // Contested — need dice roll
      return { type: "contested", artist, poolIdx, contestants };
    }
  };

  function checkSecurityVPBonus(pid, amenityType) {
    if (amenityType !== "security") return;
    const pd = playerData[pid];
    if (pd && pd.vpPerSecurity > 0) {
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + p[pid].vpPerSecurity } }));
      addLog("Effect", `+${pd.vpPerSecurity} VP from security placement!`);
      showFloatingBonus(`+${pd.vpPerSecurity} ⭐ (security)`, "#c4b5fd");
    }
  }
  
  // AI agent deployment logic
  function aiDeployAgent(pid) {
    const pd = playerData[pid] || {};
    const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
    (pd.amenities || []).forEach(a => { if (counts[a.type] !== undefined) counts[a.type]++; });
    const openStages = (pd.stageArtists || []).filter(s => s.length < 3);
    
    if (openStages.length === 0) return; // no point claiming if no stages
    
    const affordable = artistPool.filter(a => 
      counts.campsite >= a.campCost && counts.security >= a.securityCost && 
      counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost
    );
    const bestPool = affordable.sort((a, b) => (b.vp * 2 + b.tickets) - (a.vp * 2 + a.tickets))[0];
    if (!bestPool || (bestPool.vp * 2 + bestPool.tickets) <= 8) return;
    
    // Will contest if the artist is very valuable (fame 4-5), otherwise only claim unclaimed
    const alreadyClaimed = Object.values(agentPlacements).some(p => p && p.type === "pool" && p.artistName === bestPool.name);
    const worthContesting = (bestPool.vp * 2 + bestPool.tickets) > 14;
    if (!alreadyClaimed || worthContesting) {
      const poolIdx = artistPool.indexOf(bestPool);
      if (poolIdx >= 0) placeAgentOnArtist(pid, poolIdx);
    }
  }

  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  function getInUseNames() {
    const names = new Set();
    artistPool.forEach(a => names.add(a.name));
    for (const pid of Object.keys(playerData)) {
      const pd = playerData[pid];
      (pd.hand || []).forEach(a => names.add(a.name));
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => names.add(a.name)));
    }
    return names;
  }

  function drawFromDeck(count = 1) {
    const inUse = getInUseNames();
    let deck = [...artistDeck];
    let disc = [...discardPile];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      // Filter deck to exclude in-use artists
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name))); disc = disc.filter(a => inUse.has(a.name));
      }
      // Skip any in-use artists at top of deck
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) {
        disc.push(deck.pop());
      }
      if (deck.length > 0) {
        const card = deck.pop();
        drawn.push(card);
        inUse.add(card.name); // prevent drawing same card twice in one batch
      }
    }
    setArtistDeck(deck); setDiscardPile(disc);
    return drawn;
  }

  function refillPool(overridePool) {
    const inUse = getInUseNames();
    let deck = [...artistDeck]; let disc = [...discardPile]; let pool = overridePool ? [...overridePool] : [...artistPool];
    pool.forEach(a => inUse.add(a.name));
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      pool.push(card);
      inUse.add(card.name);
    }
    setArtistDeck(deck); setDiscardPile(disc); setArtistPool(pool);
  }

  // Get names of artists that have agents on them (protected from refresh)
  function getAgentProtectedNames() {
    const names = new Set();
    Object.values(agentPlacements).forEach(p => { if (p && p.type === "pool" && p.artistName) names.add(p.artistName); });
    return names;
  }

  function refreshPool(cycles = 1) {
    const inUse = getInUseNames();
    const protectedNames = getAgentProtectedNames();
    // Separate protected (agent-claimed) artists from the rest
    const protectedArtists = artistPool.filter(a => protectedNames.has(a.name));
    const unprotected = artistPool.filter(a => !protectedNames.has(a.name));
    // Only discard the unprotected artists
    unprotected.forEach(a => inUse.delete(a.name));
    let disc = [...discardPile, ...unprotected];
    let deck = [...artistDeck];
    // Start with protected artists already in pool
    let pool = [...protectedArtists];
    pool.forEach(a => inUse.add(a.name));
    const targetSize = 5;
    for (let cycle = 0; cycle < cycles; cycle++) {
      if (cycle > 0) {
        // On subsequent cycles, discard non-protected pool artists and redraw
        const newUnprotected = pool.filter(a => !protectedNames.has(a.name));
        disc = [...disc, ...newUnprotected];
        newUnprotected.forEach(a => inUse.delete(a.name));
        pool = pool.filter(a => protectedNames.has(a.name));
      }
      while (pool.length < targetSize) {
        if (deck.length === 0 && disc.length > 0) {
          deck = shuffle(disc.filter(a => !inUse.has(a.name)));
          disc = disc.filter(a => inUse.has(a.name));
        }
        while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
        if (deck.length === 0) break;
        const card = deck.pop();
        pool.push(card);
        inUse.add(card.name);
      }
    }
    setArtistPool(pool); setArtistDeck(deck); setDiscardPile(disc);
  }

  /** Trigger an effect dice roll — shows the overlay and calls callback with results */
  /** Track goal progress and check milestones */
  function trackGoalProgress(pid, trackKey) {
    setGoalProgress(prev => {
      const next = { ...prev, [pid]: { ...prev[pid], [trackKey]: (prev[pid]?.[trackKey] || 0) + 1 } };
      const newVal = next[pid][trackKey];
      activeGoals.forEach((ag, gi) => {
        if (ag.goal.trackKey !== trackKey) return;
        if (newVal < ag.goal.target) return;
        const pName = players.find(p => p.id === pid)?.festivalName || "?";
        if (ag.rewardType === "artist") {
          // First player wins the set-aside artist (plays free)
          if (goalClaimsRef.current[`${ag.goal.id}_1st`] === undefined) {
            goalClaimsRef.current[`${ag.goal.id}_1st`] = pid;
            setActiveGoals(prevG => prevG.map((g, i) => i === gi ? { ...g, claimedBy1st: pid } : g));
            const prize = ag.setAsideArtists[0];
            if (prize) {
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), { ...prize, freePlay: true }] } }));
              addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" → won ${prize.name}! (plays free)`);
              showFloatingBonus(`🏆 ${prize.name}!`, "#fbbf24"); sfx.headliner();
            }
          }
        } else {
          // VP goal: first gets 10VP, second gets 5VP
          if (goalClaimsRef.current[`${ag.goal.id}_1st`] === undefined) {
            goalClaimsRef.current[`${ag.goal.id}_1st`] = pid;
            setActiveGoals(prevG => prevG.map((g, i) => i === gi ? { ...g, claimedBy1st: pid } : g));
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 10 } }));
            addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" → +10 VP!`);
            showFloatingBonus("🏆 +10 ⭐!", "#fbbf24"); sfx.headliner();
          } else if (goalClaimsRef.current[`${ag.goal.id}_2nd`] === undefined && goalClaimsRef.current[`${ag.goal.id}_1st`] !== pid) {
            goalClaimsRef.current[`${ag.goal.id}_2nd`] = pid;
            setActiveGoals(prevG => prevG.map((g, i) => i === gi ? { ...g, claimedBy2nd: pid } : g));
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 5 } }));
            addLog("🏆 Goal", `${pName} SECOND to achieve "${ag.goal.name}" → +5 VP!`);
            showFloatingBonus("🏆 +5 ⭐!", "#fbbf24"); sfx.headliner();
          }
        }
      });
      return next;
    });
  }

  /** Check if an artist is free to play (won from goal) */
  function canAffordArtistOrFree(artist, pd) {
    if (artist.freePlay) return true;
    return canAffordArtist(artist, pd);
  }

  function triggerDiceRoll(count, pid, artistName, resultText, callback) {
    setPendingDiceRoll({ count, pid, artistName, resultText, callback, rolled: false });
  }

  // ─── Apply artist effects ───
  function applyEffect(artist, pid, times = 1, stageIdx = -1) {
    const eff = (artist.effect || "").trim();
    if (!eff) return;
    const el = eff.toLowerCase();
    // For effects that are cumulative (VP, fame, tickets, events), apply `times` iterations
    // For interactive effects (sign, draw, place), scale the amount instead of looping
    for (let t = 0; t < times; t++) {
      // === Fame effects ===
      if (el.includes("+fame") || (el.includes("+1 fame") && !el.includes("fame if"))) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("Effect", `${artist.name}: +1 Fame`);
        showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
      }
      // "+1 Fame if you have played 2 [Genre] artists this year"
      if (el.includes("fame if you have played 2")) {
        const genreMatch = eff.match(/played 2 (\w+) artists/i);
        if (genreMatch) {
          const targetGenre = genreMatch[1];
          const pd = playerData[pid];
          const count = (pd.stageArtists || []).flat().filter(a => getGenres(a.genre).includes(targetGenre)).length;
          if (count >= 2) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
            addLog("Effect", `${artist.name}: +1 Fame (2+ ${targetGenre} artists!)`);
            showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
          } else {
            addLog("Effect", `${artist.name}: Need 2 ${targetGenre} artists (have ${count})`);
          }
        }
      }
      // === VP effects ===
      if ((el.includes("+1 vp") || el.includes("+1vp")) && !el.includes("vp /") && !el.includes("vp per") && !el.includes("vp if")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 1 } }));
        addLog("Effect", `${artist.name}: +1 VP`); showFloatingBonus("+1 ⭐", "#c4b5fd");
      }
      if (el.includes("gain 1vp per existing campsite")) {
        const camps = (playerData[pid]?.amenities || []).filter(a => a.type === "campsite").length;
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + camps } }));
        addLog("Effect", `${artist.name}: +${camps} VP (1 per campsite)`);
      }
      // "+1 VP per other [Genre] act on this stage" (genre synergy)
      {
        const genreSynergyMatch = eff.match(/\+1 VP per other (\w+) (?:act|artist) on this stage/i);
        if (genreSynergyMatch && stageIdx >= 0) {
          const targetGenre = genreSynergyMatch[1];
          const stageArtists = (playerData[pid]?.stageArtists || [])[stageIdx] || [];
          const otherCount = stageArtists.filter(a => a.name !== artist.name && getGenres(a.genre).includes(targetGenre)).length;
          if (otherCount > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + otherCount } }));
            addLog("Effect", `${artist.name}: +${otherCount} VP (${otherCount} other ${targetGenre} on stage)`);
            showFloatingBonus(`+${otherCount} ⭐`, "#c4b5fd");
          }
        }
      }
      // "+1 VP per other artist on all of your stages" (Prince)
      if (el.includes("vp per other artist on all")) {
        const totalOthers = (playerData[pid]?.stageArtists || []).flat().filter(a => a.name !== artist.name).length;
        if (totalOthers > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + totalOthers } }));
          addLog("Effect", `${artist.name}: +${totalOthers} VP (${totalOthers} other artists on stages)`);
          showFloatingBonus(`+${totalOthers} ⭐`, "#c4b5fd");
        }
      }
      // "+1 VP per other [Genre] artist on this stage" variant (covers Pop/Rock/etc)
      {
        const popSynergyMatch = eff.match(/\+1 VP per other (\w+) act on this stage/i);
        // Already handled above — skip duplicate
      }
      // "Discard one artist from your hand to gain 3 tickets" (Teena Marie)
      if (el.includes("discard one artist from your hand to gain 3 tickets")) {
        setPendingEffect({ type: "discardHandForTickets", artistName: artist.name, discardCount: 1, ticketReward: 3 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 1 artist from hand for +3 tickets`);
      }
      // "Discard two artists from your hand to gain the ticket cost of one of them" (Rick James)
      if (el.includes("discard two artists from your hand to gain the ticket cost")) {
        setPendingEffect({ type: "discardHandForTicketValue", artistName: artist.name, discardCount: 2 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 2 artists, gain ticket value of one`);
      }
      // "Discard one amenity, gain 5 tickets" (Betty Davis)
      if (el.includes("discard one amenity") && el.includes("gain 5 tickets")) {
        setPendingEffect({ type: "discardAmenityForTickets", artistName: artist.name, ticketReward: 5 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 1 amenity for +5 tickets`);
      }
      // "Discard two artists from your hand, then draw the top artist from the deck and play it for free" (Silk Sonic)
      if (el.includes("discard two artists from your hand") && el.includes("play it for free")) {
        setPendingEffect({ type: "discardHandDrawFree", artistName: artist.name, discardCount: 2 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 2 artists, draw and play 1 for free!`);
      }
      // "Roll all amenity dice and gain 1 Fame if a Fame shows" (David Bowie)
      if (el.includes("roll all amenity dice") && el.includes("gain 1 fame if a fame shows")) {
        triggerDiceRoll(5, pid, artist.name,
          (results) => { const hasFame = results.some(d => d === "fame"); return hasFame ? "🔥 Fame shown! +1 Fame" : "No fame shown"; },
          (results) => { if (results.some(d => d === "fame")) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } })); showFloatingBonus("+1 🔥", "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // "-2 VP. Draw an artist objective" (Missy Elliott) — just give VP loss, objective draw is bonus
      if (el.includes("draw an artist objective")) {
        // Draw from objective deck if available
        if (objectiveDeck && objectiveDeck.length > 0) {
          const newObj = objectiveDeck[Math.floor(Math.random() * objectiveDeck.length)];
          setPlayerObjectives(prev => ({ ...prev, [pid]: newObj }));
          addLog("Effect", `${artist.name}: Drew new artist objective: ${newObj.name}`);
          showFloatingBonus(`📋 ${newObj.name}`, "#c4b5fd");
        } else {
          addLog("Effect", `${artist.name}: No objectives available to draw`);
        }
      }
      // === -VP effects (Hip Hop risk/reward) ===
      // "-X VP" — generic VP loss patterns
      {
        const vpLossMatch = eff.match(/-(\d+)\s*VP/i);
        if (vpLossMatch) {
          const vpLoss = parseInt(vpLossMatch[1]);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: Math.max(0, (p[pid].vp || 0) - vpLoss) } }));
          addLog("Effect", `${artist.name}: -${vpLoss} VP`);
          showFloatingBonus(`-${vpLoss} ⭐`, "#ef4444");
        }
      }
      // "Sell X tickets" — bonus tickets from -VP effects
      {
        const sellMatch = eff.match(/[Ss]ell\s+(\d+)\s+tickets?/i);
        if (sellMatch) {
          const tix = parseInt(sellMatch[1]);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + tix } }));
          addLog("Effect", `${artist.name}: +${tix} ticket sales`);
          showFloatingBonus(`+${tix} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / 2 amenities" (Flume)
      if (el.includes("ticket / 2 amenities") || el.includes("ticket/ 2 amenities")) {
        const amCount = (playerData[pid]?.amenities || []).length;
        const tix = Math.floor(amCount / 2);
        if (tix > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + tix } }));
          addLog("Effect", `${artist.name}: +${tix} tickets (1 per 2 amenities)`);
          showFloatingBonus(`+${tix} 🎟️`, "#fbbf24");
        }
      }
      // "+1 Fame if you have played 2 artists of either X or Y" (Charli XCX)
      if (el.includes("fame if you have played 2 artists of either")) {
        const genreMatch = eff.match(/either (\w+) or (\w+)/i);
        if (genreMatch) {
          const pd = playerData[pid];
          const booked = (pd.stageArtists || []).flat();
          const count = booked.filter(a => getGenres(a.genre).includes(genreMatch[1]) || getGenres(a.genre).includes(genreMatch[2])).length;
          if (count >= 2) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
            addLog("Effect", `${artist.name}: +1 Fame (2+ ${genreMatch[1]}/${genreMatch[2]} artists!)`);
            showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
          } else {
            addLog("Effect", `${artist.name}: Need 2 ${genreMatch[1]}/${genreMatch[2]} artists (have ${count})`);
          }
        }
      }
      // "for X Fame" — gain fame as part of VP trade (Loyle Carner "-2 VP for 1 Fame")
      {
        const forFameMatch = eff.match(/for (\d+) Fame/i);
        if (forFameMatch && el.includes("-") && el.includes("vp")) {
          const fameGain = parseInt(forFameMatch[1]);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain) } }));
          addLog("Effect", `${artist.name}: +${fameGain} Fame`);
          showFloatingBonus(`+${fameGain} 🔥`, "#f97316"); sfx.gainFame();
        }
      }
      // "Roll 1 amenity dice and gain 1 Fame for each Fame shown" (Loyle Carner)
      if (el.includes("roll 1 amenity dice") || el.includes("roll 1 amenity die")) {
        triggerDiceRoll(1, pid, artist.name, "+1 Fame per Fame shown",
          (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameCount) } })); showFloatingBonus(`+${fameCount} 🔥`, "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // === Ticket effects ===
      if (el.includes("+4 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 4 } }));
        addLog("Effect", `${artist.name}: +4 ticket sales`); showFloatingBonus("+4 🎟️", "#fbbf24");
      }
      if (el.includes("+5 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 5 } }));
        addLog("Effect", `${artist.name}: +5 ticket sales`); showFloatingBonus("+5 🎟️", "#fbbf24");
      }
      // "+1 ticket sale for all players"
      if (el.includes("ticket sale for all players") || el.includes("ticket sales for all players")) {
        players.forEach(p => {
          setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + 1 } }));
        });
        addLog("Effect", `${artist.name}: +1 ticket for ALL players!`);
        showFloatingBonus("+1 🎟️ all!", "#fbbf24");
      }
      // "+1 ticket sale / Current Fame Level"
      if (el.includes("ticket sale / current fame") || el.includes("ticket / current fame")) {
        const fame = playerData[pid]?.fame || 0;
        if (fame > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fame } }));
          addLog("Effect", `${artist.name}: +${fame} tickets (1 per Fame level)`);
          showFloatingBonus(`+${fame} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / Negative Event this year"
      if (el.includes("ticket / negative event this year") || el.includes("ticket / negative event")) {
        const negCount = (playerPersonalEvents[pid] || []).filter(e => e.color === "red").length;
        if (negCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + negCount } }));
          addLog("Effect", `${artist.name}: +${negCount} tickets (1 per negative event)`);
          showFloatingBonus(`+${negCount} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / amenity adjacent to this artist's stage"
      if (el.includes("ticket / amenity adjacent") || el.includes("ticket/ amenity adjacent")) {
        const pd = playerData[pid];
        let adjCount = 0;
        // Use passed stageIdx if available, otherwise search
        const targetStages = stageIdx >= 0 ? [stageIdx] : (pd.stageArtists || []).map((sa, si) => sa.some(a => a.name === artist.name) ? si : -1).filter(i => i >= 0);
        targetStages.forEach(si => {
          const stage = (pd.stages || [])[si];
          if (stage) {
            const stageHexes = getStageHexes(stage.col, stage.row);
            adjCount += (pd.amenities || []).filter(am => stageHexes.some(h => areAdjacent(am.col, am.row, h.col, h.row))).length;
          }
        });
        if (adjCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + adjCount } }));
          addLog("Effect", `${artist.name}: +${adjCount} tickets (amenities near stage)`);
          showFloatingBonus(`+${adjCount} 🎟️`, "#fbbf24");
        }
      }
      // === Event effects ===
      if (el.includes("+1 negative personal event")) {
        const negEvents = ALL_EVENTS.filter(e => e.color === "red");
        const drawn = negEvents[Math.floor(Math.random() * negEvents.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 🔴 Negative Personal Event`);
      }
      if (el.includes("+1 negative global event")) {
        const negEvents = ALL_EVENTS.filter(e => e.color === "red");
        const drawn = negEvents[Math.floor(Math.random() * negEvents.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 🔴 Negative Event added`);
      }
      if (el.includes("+1 global event") && !el.includes("negative")) {
        const allEvt = ALL_EVENTS;
        const drawn = allEvt[Math.floor(Math.random() * allEvt.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 Event (${drawn?.color === "green" ? "🟢" : "🔴"})`);
      }
      if (el.includes("+1 event") && !el.includes("personal") && !el.includes("negative") && !el.includes("global")) {
        const posEvents = ALL_EVENTS.filter(e => e.color === "green");
        const drawn = posEvents[Math.floor(Math.random() * posEvents.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 🟢 Event drawn`);
      }
      // === All players draw ===
      if (el.includes("all players draw 1 artist")) {
        const allDrawn = drawFromDeck(players.length);
        players.forEach((p, i) => {
          if (i < allDrawn.length) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), allDrawn[i]] } }));
            addLog("Effect", `${artist.name}: ${p.festivalName} drew ${allDrawn[i].name}`);
          }
        });
        showFloatingBonus("🃏 All draw!", "#c4b5fd");
      }
    }
    // Interactive effects — scale by times instead of looping (setPendingEffect can only hold one)
    if (el.includes("+1 security") && el.includes("place")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    } else if (el.includes("+1 security")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    }
    if (el.includes("+1 amenity") || el.includes("gain 1 amenity")) {
      setPendingEffect({ type: "placeAmenity", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Amenity — choose and place!`);
    }
    if (el.includes("sign 1 artist") || el.includes("sign one artist")) {
      // Headliner: sign `times` artists (draw times cards from pool/deck)
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: el.includes("refresh"), signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Sign ${times} artist${times > 1 ? "s" : ""} from pool or deck!`);
    }
    if (el.includes("draw two artists")) {
      // Headliner: draw 2*times, pick times to keep
      const drawCount = 2 * times;
      const drawn = drawFromDeck(drawCount);
      if (drawn.length > 0) {
        setPendingEffect({ type: "pickFromDrawn", drawn, artistName: artist.name, keepCount: times });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Drew ${drawn.length} artists — pick ${times} to keep!`);
      }
    }
    if (el.includes("immediately book another")) {
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: false, signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Immediately book ${times > 1 ? times + " artists" : "another artist"}!`);
    }
    if (el.includes("year end")) {
      addLog("Effect", `${artist.name}: ${eff} (triggers at year end)`);
    }
    // Dice roll effects — "Roll X dice" or "Roll all" patterns
    // Skip year-end effects (handled in beginRoundEnd) and Loyle Carner (handled above)
    if (!el.includes("year end") && !el.includes("roll 1 amenity dic") && !el.includes("gain 1 fame if a fame shows")) {
      let rollMatch = el.match(/roll (\d+)\s+(?:amenity\s+)?dice/);
      if (!rollMatch && el.includes("roll all")) rollMatch = [null, "5"]; // "Roll all" = Roll 5
      if (rollMatch) {
        const rollCount = parseInt(rollMatch[1]);
        if (el.includes("each fame") && el.includes("ticket")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const fameCount = results.filter(d => d === "fame").length; return `🔥 ${fameCount} Fame dice = +${fameCount * 2} tickets`; },
            (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fameCount * 2 } })); showFloatingBonus(`+${fameCount * 2} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("most common") || el.includes("best streak")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); return `Best streak: ${best} = +${best} VP`; },
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); if (best > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + best } })); showFloatingBonus(`+${best} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("ticket")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} tickets`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + unique } })); showFloatingBonus(`+${unique} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("vp")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} VP`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + unique } })); showFloatingBonus(`+${unique} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
          );
        } else {
          // Generic roll — just show results
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => `Rolled: ${results.map(d => d === "fame" ? "🔥" : AMENITY_ICONS[d] || d).join(" ")}`,
            () => { setTimeout(() => recalcTickets(), 50); }
          );
        }
      }
    }
    setTimeout(() => recalcTickets(), 50);
  }

  // ─── Book artist to stage ───
  function bookArtistToStage(artist, stageIdx, pid) {
    setPlayerData(prev => {
      const pd = { ...prev[pid] };
      const sa = [...(pd.stageArtists || pd.stages.map(() => []))];
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      const isFullLineup = sa[stageIdx].length === 3;
      pd.stageArtists = sa;
      // Artist VP is NOT awarded on booking — tallied at year end
      if (isFullLineup && !firstFullLineup) {
        pd.bonusTickets = (pd.bonusTickets || 0) + 5;
        setFirstFullLineup(true);
        addLog("🎪 FIRST!", `${players.find(p => p.id === pid)?.festivalName} released the first full lineup! +5 tickets!`);
        showFloatingBonus("+5 🎟️ First Lineup!", "#4ade80");
      }
      // Full lineup bonus: draw 1 personal event + gain 1 Fame
      if (isFullLineup) {
        pd.baseFame = Math.min(FAME_MAX, (pd.baseFame || 0) + 1);
        addLog("🎤 Full Lineup", `${players.find(p => p.id === pid)?.festivalName} completed a lineup → +1 Fame!`);
        showFloatingBonus("+1 🔥 Lineup!", "#f97316");
        const allEvts = [...ALL_EVENTS];
        const drawn = allEvts[Math.floor(Math.random() * allEvts.length)];
        if (drawn) {
          setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] }));
          addLog("🎤 Full Lineup", `${players.find(p => p.id === pid)?.festivalName} drew 1 personal event (${drawn.color === "green" ? "🟢" : "🔴"})`);
        }
      }
      return { ...prev, [pid]: pd };
    });

    const pd = playerData[pid];
    const sa = pd.stageArtists || pd.stages.map(() => []);
    const slotCount = (sa[stageIdx] || []).length + 1;
    const isHeadliner = slotCount === 3;
    const sName = (pd.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    const festival = players.find(p => p.id === pid)?.festivalName;

    // Show the booking popup (headliner popup takes priority if headliner)
    if (isHeadliner) {
      setShowHeadliner({ artist, festival });
      addLog("🌟 HEADLINER", `${artist.name} headlines at ${festival}!`);
      sfx.headliner();
      applyEffect(artist, pid, 1, stageIdx);
    } else {
      setShowBookedArtist({ artist, stageName: sName, isHeadliner: false, festival });
      sfx.bookArtist();
      applyEffect(artist, pid, 1, stageIdx);
    }

    // Floating bonuses for VP and tickets
    // VP tallied at year end — show ticket bonus only
    if (artist.tickets > 0) { showFloatingBonus(`+${artist.tickets} 🎟️`, "#fbbf24"); sfx.gainTickets(); }

    addLog(festival, `booked ${artist.name} to ${sName}${isHeadliner ? " as HEADLINER!" : ""}`);

    // Check microtrends — first player to book matching genre claims it
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (getGenres(artist.genre).includes(mt.genre)) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("🎵 Microtrend", `${festival} claimed "${mt.genre}" microtrend → +1 🔥 Fame!`);
        showFloatingBonus(`🎵 ${mt.genre} Microtrend!`, GENRE_COLORS[mt.genre] || "#fbbf24");
        return { ...mt, claimedBy: pid };
      }
      return mt;
    }));

    setTimeout(() => recalcTickets(), 50);
  }

  // ─── Evaluate objectives for a player ───
  /** Count how many full lineups match a genre objective */
  function countGenreLineups(obj, pd) {
    if (!obj || !obj.genre) return { count: 0, genre: null };
    const sa = pd.stageArtists || [];
    let count = 0;
    sa.forEach(s => { if (s.length === 3 && s.every(a => getGenres(a.genre).includes(obj.genre))) count++; });
    return { count, genre: obj.genre };
  }

  /** Apply objective rewards at the start of a round */
  function applyObjectiveRewards() {
    players.forEach(p => {
      const obj = playerObjectives[p.id];
      if (!obj) return;
      const pd = playerData[p.id];
      const { count, genre } = countGenreLineups(obj, pd);
      if (count === 0) return;
      if (count >= 2) {
        setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], baseFame: Math.min(FAME_MAX, (prev[p.id].baseFame || 0) + 1) } }));
        addLog(p.festivalName, `🎯 ${obj.name}: 2+ ${genre} lineups → +1 Fame!`);
      }
      switch (genre) {
        case "Pop": {
          const popInPool = artistPool.filter(a => getGenres(a.genre).includes("Pop"));
          if (popInPool.length > 0) {
            const pick = popInPool[Math.floor(Math.random() * popInPool.length)];
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), pick] } }));
            setArtistPool(prev => prev.filter(a => a !== pick));
            addLog(p.festivalName, `🎯 ${obj.name}: Drew ${pick.name} from pool!`);
          }
          break;
        }
        case "Rock": {
          const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 3);
          const fameCount = results.filter(d => d === "fame").length;
          if (fameCount > 0) setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + fameCount } }));
          addLog(p.festivalName, `🎯 ${obj.name}: Rolled 3 dice → ${fameCount} Fame → +${fameCount} tickets`);
          break;
        }
        case "Electronic": {
          const pos = aiFindPlacement(pd);
          if (pos) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], amenities: [...prev[p.id].amenities, { col: pos.col, row: pos.row, type: "campsite" }] } }));
            addLog(p.festivalName, `🎯 ${obj.name}: Placed free ⛺ campsite!`);
          }
          break;
        }
        case "Hip Hop": {
          setPlayerPersonalEvents(prev => {
            const evts = [...(prev[p.id] || [])];
            const negIdx = evts.findIndex(e => e.color === "red");
            if (negIdx >= 0) { evts.splice(negIdx, 1); addLog(p.festivalName, `🎯 ${obj.name}: Discarded 1 negative event!`); }
            else { addLog(p.festivalName, `🎯 ${obj.name}: No negative events to discard`); }
            return { ...prev, [p.id]: evts };
          });
          break;
        }
        case "Indie": {
          players.forEach(op => {
            if (op.id !== p.id) setPlayerData(prev => ({ ...prev, [op.id]: { ...prev[op.id], bonusTickets: (prev[op.id].bonusTickets || 0) + 1 } }));
          });
          addLog(p.festivalName, `🎯 ${obj.name}: Every other player gains +1 ticket!`);
          break;
        }
        case "Funk": {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), ...drawn] } }));
            addLog(p.festivalName, `🎯 ${obj.name}: Drew ${drawn[0].name} from deck!`);
          }
          break;
        }
      }
    });
    setTimeout(() => recalcTickets(), 50);
  }

  // ═══════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════
  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const np = []; for (let i = 0; i < count; i++) np.push(players[i] || { id: i, name: `Player ${i + 1}`, festivalName: "", isAI: false });
    setPlayers(np.map((p, i) => ({ ...p, id: i })));
  };
  const randomizeName = (idx) => { const n = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]; setPlayers(p => p.map((pp, i) => i === idx ? { ...pp, festivalName: n } : pp)); };
  const canStartSetup = players.every(p => p.festivalName.trim().length > 0);

  const startSetup = () => {
    const data = {}; players.forEach(p => { data[p.id] = { stages: [], amenities: [], fame: 0, baseFame: 0, vpPerSecurity: 0, vp: 0, tickets: 0, rawTickets: 0, setupAmenity: null, hand: [], stageArtists: [], bonusTickets: 0, stageNames: [], stageColors: [] }; });
    setPlayerData(data); setSetupIndex(0); setSetupSelectedAmenity(null);
    // Assign council objectives (1 per player, unique — no multi-stage councils in Year 1)
    const cDeckAll = shuffle([...ALL_COUNCIL_OBJECTIVES]);
    const year1Safe = cDeckAll.filter(c => !c.requiresMultiStage);
    const multiStage = cDeckAll.filter(c => c.requiresMultiStage);
    const pCouncils = {};
    players.forEach(p => {
      const co = year1Safe.pop();
      pCouncils[p.id] = co ? [{ obj: co, active: true, fameGranted: false }] : [];
    });
    // Put multi-stage councils back into deck (they can be drawn in later years)
    const cDeck = shuffle([...year1Safe, ...multiStage]);
    setPlayerCouncils(pCouncils); setCouncilDeck(cDeck);
    // Separate 0-fame and 5-fame artists for drafting
    const all = shuffle([...ALL_ARTISTS]);
    const fame0 = shuffle(all.filter(a => a.fame === 0));
    const fame5 = shuffle(all.filter(a => a.fame === 5));
    setDraftRemaining0(fame0); setDraftRemaining5(fame5); setUndraftedArtists([]);
    setArtistDeck([]); setArtistPool([]); setDiscardPile([]); setFirstFullLineup(false);
    // Assign unique objectives to each player
    const objDeck = shuffle([...ALL_OBJECTIVES]);
    const assigned = {}; const usedNames = new Set();
    players.forEach(p => {
      const pick = objDeck.find(o => !usedNames.has(o.name));
      if (pick) { assigned[p.id] = pick; usedNames.add(pick.name); objDeck.splice(objDeck.indexOf(pick), 1); }
      else { assigned[p.id] = objDeck.pop(); } // fallback if more players than unique objectives
    });
    setPlayerObjectives(assigned);
    setObjectiveDeck(objDeck); setTrendingObjective(null);

    // Initialize Goals — draw 2 random goals, set aside 2 artists per goal
    const goalPool = shuffle([...ALL_GOALS]);
    const selectedGoals = goalPool.slice(0, 2);
    const fame4Artists = shuffle(all.filter(a => a.fame === 4));
    const goals = selectedGoals.map((goal, gi) => {
      if (gi === 0) {
        const prize = fame4Artists[gi] || fame4Artists[0];
        return { goal, rewardType: "artist", setAsideArtists: [prize], claimedBy1st: null, claimedBy2nd: null };
      } else {
        return { goal, rewardType: "vp", setAsideArtists: [], claimedBy1st: null, claimedBy2nd: null };
      }
    });
    setActiveGoals(goals);
    const setAsideNames = new Set(goals.flatMap(g => g.setAsideArtists.map(a => a.name)));
    setDraftRemaining0(fame0.filter(a => !setAsideNames.has(a.name)));
    setDraftRemaining5(fame5.filter(a => !setAsideNames.has(a.name)));
    const gp = {};
    players.forEach(p => { gp[p.id] = { portalooRefreshes: 0, fameDieRolls: 0, artistsSigned: 0, councilsBought: 0, eventsBlocked: 0 }; });
    setGoalProgress(gp);
    setGoalReq1Claimed({});
    goalClaimsRef.current = {};
    addLog("🏆 Goals", `${goals.map(g => g.goal.name).join(" & ")} — race begins!`);

    // Start at council reveal
    setSetupStep("viewCouncil");
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    setPhase("setup"); addLogH("Setup Phase", "year");
  };

  // ═══════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════
  const currentSetupPlayer = players[setupIndex];

  const confirmViewCouncil = () => {
    const co = (playerCouncils[currentSetupPlayer.id] || [])[0];
    if (co) addLog(currentSetupPlayer.festivalName, `received council objective: ${co.obj.name}`);
    setSetupStep("viewObjective");
  };

  const confirmViewObjective = () => {
    addLog(currentSetupPlayer.festivalName, `received objective: ${playerObjectives[currentSetupPlayer.id]?.name}`);
    // Prepare this player's draft options
    setSetupDraftOptions([...draftRemaining0.slice(0, 6)]);
    setSetupDraftSelected([]);
    setSetupStep("draftArtist");
  };

  const confirmSetupAmenity = () => {
    setPlayerData(p => ({ ...p, [currentSetupPlayer.id]: { ...p[currentSetupPlayer.id], setupAmenity: setupSelectedAmenity } }));
    addLog(currentSetupPlayer.festivalName, `chose ${AMENITY_LABELS[setupSelectedAmenity]}`);
    setSetupStep("placeStage");
  };

  const toggleDraftSelection = (idx) => {
    setSetupDraftSelected(prev => {
      const arr = prev || [];
      if (arr.includes(idx)) return arr.filter(i => i !== idx);
      if (arr.length >= 2) return arr; // max 2
      return [...arr, idx];
    });
  };

  const confirmSetupDraft = () => {
    const selected = setupDraftSelected || [];
    if (selected.length !== 2) return;
    const chosen = selected.map(i => setupDraftOptions[i]);
    // Add both to player hand
    setPlayerData(p => ({ ...p, [currentSetupPlayer.id]: { ...p[currentSetupPlayer.id], hand: [...p[currentSetupPlayer.id].hand, ...chosen] } }));
    chosen.forEach(c => addLog(currentSetupPlayer.festivalName, `drafted ${c.name} (${c.genre})`));
    // Collect unchosen back
    const unchosen = setupDraftOptions.filter((_, i) => !selected.includes(i));
    setUndraftedArtists(prev => [...prev, ...unchosen]);
    // Advance the draft pools past the 2 we offered from each
    const newR0 = draftRemaining0.slice(6);
    const newR5 = draftRemaining5;
    setDraftRemaining0(newR0); setDraftRemaining5(newR5);
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    setSetupStep("pickAmenity");
  };
  const handleSetupHexClick = (col, row) => {
    const pid = currentSetupPlayer.id; const pd = playerData[pid];
    if (setupStep === "placeStage") {
      if (!stageFullyInBounds(col, row) || stageWouldOverlap(col, row, pd.stages)) return;
      const usedNames = pd.stageNames || [];
      const availNames = STAGE_NAMES.filter(n => !usedNames.includes(n));
      const sName = availNames[Math.floor(Math.random() * availNames.length)] || `Stage ${pd.stages.length + 1}`;
      const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], stages: [...p[pid].stages, { col, row }], stageArtists: [...(p[pid].stageArtists || []), []], stageNames: [...(p[pid].stageNames || []), sName], stageColors: [...(p[pid].stageColors || []), sColor] } }));
      setSetupStep("placeAmenity");
    } else if (setupStep === "placeAmenity") {
      const updPD = playerData[pid];
      if (isOnStage(col, row, updPD.stages)) return;
      if (updPD.amenities.some(a => a.col === col && a.row === row)) return;
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: p[pid].setupAmenity }] } }));
      setSetupStep("confirm");
    }
  };
  const confirmSetupPlacement = () => {
    addLog(currentSetupPlayer.festivalName, `placed stage and ${AMENITY_LABELS[playerData[currentSetupPlayer.id].setupAmenity]}`);
    sfx.placeStage();
    if (setupIndex < players.length - 1) {
      const nextIdx = setupIndex + 1;
      setSetupIndex(nextIdx); setSetupSelectedAmenity(null);
      setSetupDraftOptions([]); setSetupDraftSelected([]);
      setSetupStep("viewCouncil");
    } else startGame();
  };
  const undoSetupPlacement = () => {
    const pid = currentSetupPlayer.id;
    if (setupStep === "confirm") { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: p[pid].amenities.slice(0, -1) } })); setSetupStep("placeAmenity"); }
    else if (setupStep === "placeAmenity") { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], stages: p[pid].stages.slice(0, -1), stageArtists: (p[pid].stageArtists || []).slice(0, -1), stageNames: (p[pid].stageNames || []).slice(0, -1), stageColors: (p[pid].stageColors || []).slice(0, -1) } })); setSetupStep("placeStage"); }
  };

  // ═══════════════════════════════════════════════════════════
  // GAME START
  // ═══════════════════════════════════════════════════════════
  const startGame = () => {
    // Build the full deck: all artists minus those drafted by players
    const draftedNames = new Set();
    players.forEach(p => { (playerData[p.id]?.hand || []).forEach(a => draftedNames.add(a.name)); });
    const remainingArtists = ALL_ARTISTS.filter(a => !draftedNames.has(a.name));
    // Shuffle undrafted offers back in with the rest
    const fullDeck = shuffle([...remainingArtists]);
    const pool = fullDeck.splice(0, 5);
    setArtistDeck(fullDeck); setArtistPool(pool); setDiscardPile([]);

    const order = players.map(p => p.id); setTurnOrder(order); setCurrentPlayerIdx(0);
    const tl = {}; order.forEach(id => { tl[id] = TURNS_PER_YEAR[1]; }); setTurnsLeft(tl);
    setYear(1); setDice(rollDice()); setPhase("game"); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // Init events — no global events, personal events drawn at year end
    const eDeck = shuffle([...ALL_EVENTS]);
    setEventDeck(eDeck);
    // Init microtrends
    const mt = generateMicrotrends();
    setMicrotrends(mt);
    addLog("🎵 Microtrends", `Book a ${mt[0].genre} artist • Book a ${mt[1].genre} artist`);
    // Draw trending council objective
    const tcPool = ALL_COUNCIL_OBJECTIVES.filter(c => !Object.values(playerCouncils).flat().some(pc => pc.obj?.id === c.id));
    const tc = tcPool.length > 0 ? tcPool[Math.floor(Math.random() * tcPool.length)] : ALL_COUNCIL_OBJECTIVES[0];
    setTrendingCouncil(tc); trendingCouncilRef.current = tc;
    addLog("📋 Trending Council", `${tc.name} — ${tc.tBenefit}`);
    setTimeout(() => recalcTickets(), 50); addLogH("Year 1 Begins", "year"); addLogH(`${players[0]?.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  // Auto-recalculate tickets whenever playerData, councils, or trending changes
  // This catches any stale closure issues from batched setPlayerData calls
  const recalcTicketsRef = useRef(recalcTickets);
  recalcTicketsRef.current = recalcTickets;
  const [recalcTrigger, setRecalcTrigger] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => recalcTicketsRef.current(), 100);
    return () => clearTimeout(timer);
  }, [recalcTrigger, playerCouncils, trendingCouncil]);
  // Bump trigger on any amenity/artist/council change to force re-calc
  useEffect(() => { setRecalcTrigger(t => t + 1); }, [playerCouncils]);

  // ═══════════════════════════════════════════════════════════
  // AI AUTO-PLAY (ref-based to prevent re-trigger loops)
  // ═══════════════════════════════════════════════════════════
  const aiProcessing = useRef(false);
  const aiTimer = useRef(null);

  const isCurrentPlayerAI = () => {
    if (phase === "setup") return players[setupIndex]?.isAI;
    if (phase === "game") return currentPlayer?.isAI;
    return false;
  };

  // Single AI step function — does ONE thing then returns. Called repeatedly via setTimeout.
  const aiStep = () => {
    if (aiProcessing.current) return;
    if (!isCurrentPlayerAI()) return;
    aiProcessing.current = true;

    const scheduleNext = (ms = 500) => {
      aiProcessing.current = false;
      aiTimer.current = setTimeout(() => aiStep(), ms);
    };

    // ─── Handle pending effects for AI ───
    if (pendingEffect && pendingEffectPid !== null) {
      const pid = pendingEffectPid;
      const pd = playerData[pid] || {};
      const pe = pendingEffect;
      if (pe.type === "placeSpecific" || (pe.type === "placeAmenity" && pe.chosenType)) {
        const pos = aiFindPlacement(pd);
        const aType = pe.amenityType || pe.chosenType;
        setPlayerData(p => {
          const updated = { ...p[pid], amenities: [...p[pid].amenities, { col: pos.col, row: pos.row, type: aType }] };
          if (aType === "security" && p[pid].vpPerSecurity > 0) {
            updated.vp = (updated.vp || 0) + p[pid].vpPerSecurity;
          }
          return { ...p, [pid]: updated };
        });
        addLog("🤖 AI", `Placed bonus ${AMENITY_LABELS[aType]}`);
        const remaining = (pe.placeCount || 1) - 1;
        if (remaining > 0) {
          if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
          else setPendingEffect({ ...pe, placeCount: remaining });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        setTimeout(() => recalcTickets(), 50);
        scheduleNext(400); return;
      }
      if (pe.type === "placeAmenity" && !pe.chosenType) {
        const choice = aiPickAmenityType(pd);
        setPendingEffect({ ...pe, chosenType: choice });
        scheduleNext(300); return;
      }
      if (pe.type === "signArtist") {
        const remaining = pe.signCount || 1;
        if (artistPool.length > 0) {
          const best = [...artistPool].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
          const idx = artistPool.indexOf(best);
          const np = [...artistPool]; np.splice(idx, 1);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
          addLog("🤖 AI", `Signed ${best.name} from pool`);
          refillPool(np);
        }
        if (remaining > 1) {
          setPendingEffect({ ...pe, signCount: remaining - 1 });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        scheduleNext(400); return;
      }
      if (pe.type === "pickFromDrawn" && pe.drawn?.length > 0) {
        const best = pe.drawn.sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
        const other = pe.drawn.filter(a => a !== best);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
        setDiscardPile(prev => [...prev, ...other]);
        addLog("🤖 AI", `Kept ${best.name}`);
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(400); return;
      }
      // Fallback: clear unknown pending effect
      setPendingEffect(null); setPendingEffectPid(null);
      scheduleNext(200); return;
    }

    // ─── SETUP PHASE ───
    if (phase === "setup") {
      const pid = players[setupIndex]?.id;
      if (setupStep === "viewCouncil") { confirmViewCouncil(); scheduleNext(400); return; }
      if (setupStep === "viewObjective") { confirmViewObjective(); scheduleNext(400); return; }
      if (setupStep === "draftArtist" && setupDraftOptions.length >= 2) {
        const picks = aiDraftSelect(setupDraftOptions);
        setSetupDraftSelected(picks);
        // Need to call confirmSetupDraft after state updates
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupDraft(); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "pickAmenity") {
        const amenityChoice = aiPickSetupAmenity();
        setSetupSelectedAmenity(amenityChoice);
        // Set directly in playerData to avoid stale state
        setPlayerData(p => ({ ...p, [players[setupIndex].id]: { ...p[players[setupIndex].id], setupAmenity: amenityChoice } }));
        addLog(players[setupIndex].festivalName, `chose ${AMENITY_LABELS[amenityChoice]}`);
        setSetupStep("placeStage");
        scheduleNext(400);
        return;
      }
      if (setupStep === "placeStage") {
        const pd = playerData[pid] || {};
        const pos = aiFindStagePlacement(pd);
        handleSetupHexClick(pos.col, pos.row);
        scheduleNext(400); return;
      }
      if (setupStep === "placeAmenity") {
        const pd = playerData[pid] || {};
        const pos = aiFindPlacement(pd);
        handleSetupHexClick(pos.col, pos.row);
        scheduleNext(400); return;
      }
      if (setupStep === "confirm") { confirmSetupPlacement(); scheduleNext(600); return; }
      aiProcessing.current = false; return;
    }

    // ─── PRE-ROUND PHASE (between years) ───
    if (phase === "preRound") {
      if (preRoundStep === "notify") {
        if (canOpenStage) { acceptNewStage(); scheduleNext(400); }
        else { startPreRoundDraws(); scheduleNext(400); }
        return;
      }
      if (preRoundStep === "placeStage") {
        const pd = playerData[currentPreRoundPlayer?.id] || {};
        const pos = aiFindStagePlacement(pd);
        handlePreRoundHexClick(pos.col, pos.row); scheduleNext(400); return;
      }
      if (preRoundStep === "moveDisplaced") {
        const pd = playerData[currentPreRoundPlayer?.id] || {};
        const pos = aiFindPlacement(pd);
        handlePreRoundHexClick(pos.col, pos.row); scheduleNext(300); return;
      }
      if (preRoundStep === "confirmStage") { confirmPreRoundStage(); scheduleNext(400); return; }
      if (preRoundStep === "preRoundDrawChoose") {
        // AI draws artist — prefer from pool if available, otherwise deck
        const pid = currentPreRoundPlayer?.id;
        if (artistPool.length > 0) {
          // Pick best artist from pool
          const best = artistPool.reduce((a, b) => (a.vp + a.tickets > b.vp + b.tickets ? a : b));
          const idx = artistPool.indexOf(best);
          const newPool = [...artistPool]; newPool.splice(idx, 1); setArtistPool(newPool);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), best] } }));
          addLog("🤖 AI", `${currentPreRoundPlayer.festivalName} drew ${best.name} from pool (free draw)`);
        } else {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn[0]] } }));
            addLog("🤖 AI", `${currentPreRoundPlayer.festivalName} drew ${drawn[0].name} from deck (free draw)`);
          }
        }
        const newPlaced = freeAmenityPlaced + 1; setFreeAmenityPlaced(newPlaced);
        if (newPlaced < freeAmenityCount) { setPreRoundStep("preRoundDrawChoose"); scheduleNext(300); }
        else { nextPreRound(); scheduleNext(400); }
        return;
      }
      aiProcessing.current = false; return;
    }

    // ─── YEAR-END EFFECTS PHASE ───
    if (phase === "yearEndEffects") {
      // Auto-resolve current effect for AI (or advance for human after they click)
      const yep = players[yearEndEffectsPlayer];
      if (yep?.isAI) {
        const effects = yearEndEffectsList[yep.id] || [];
        const eff = effects[yearEndEffectIdx];
        if (eff) {
          if (eff.type === "rollUnique") {
            const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
            const vp = new Set(results).size;
            resolveYearEndEffect({ vp });
          } else if (eff.type === "rollCommon") {
            const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
            const c = {}; results.forEach(d => { c[d]=(c[d]||0)+1; });
            resolveYearEndEffect({ vp: Math.max(...Object.values(c)) });
          } else {
            resolveYearEndEffect();
          }
          scheduleNext(300); return;
        } else {
          advanceYearEndEffect();
          scheduleNext(300); return;
        }
      }
      aiProcessing.current = false; return;
    }

    // ─── GAME PHASE ───
    if (phase === "game") {
      if (showYearAnnouncement) { setShowYearAnnouncement(false); setShowTurnStart(true); scheduleNext(500); return; }
      if (pendingDiceRoll) {
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingDiceRoll.count);
        if (pendingDiceRoll.callback) pendingDiceRoll.callback(results);
        setPendingDiceRoll(null);
        scheduleNext(500); return;
      }
      if (showTurnStart) {
        setShowTurnStart(false);
        setTurnNumber(prev => prev + 1);
        // AI: resolve pool agent claims at turn start
        const resolution = resolvePoolAgents(currentPlayerId);
        if (resolution && resolution.type === "uncontested") {
          // Auto-book uncontested agent claim
          const artist = resolution.artist;
          const pd2 = playerData[currentPlayerId] || {};
          const openStages = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
          if (openStages.length > 0) {
            const si = openStages[0];
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            bookArtistToStage(artist, si, currentPlayerId);
            exhaustAgent(currentPlayerId);
            addLog("🕵️ AI Agent", `${currentPlayer?.festivalName} booked ${artist.name} (uncontested claim)`);
          } else {
            // No open stages — add to hand
            setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            exhaustAgent(currentPlayerId);
          }
        } else if (resolution && resolution.type === "contested") {
          // Contested: first placer wins (simplified for AI)
          const sorted = resolution.contestants.sort((a, b) => a.placedTurn - b.placedTurn);
          const winnerId = sorted[0].pid;
          const artist = resolution.artist;
          const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
          if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
          const winPd = playerData[winnerId] || {};
          const openStages = (winPd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
          if (openStages.length > 0) {
            bookArtistToStage(artist, openStages[0], winnerId);
          } else {
            setPlayerData(p => ({ ...p, [winnerId]: { ...p[winnerId], hand: [...p[winnerId].hand, artist] } }));
          }
          // Winner's agent is exhausted, losers get theirs back
          exhaustAgent(winnerId);
          sorted.filter(c => c.pid !== winnerId).forEach(c => returnAgent(c.pid));
          addLog("🕵️ Agent", `${players.find(p => p.id === winnerId)?.festivalName} won contest for ${artist.name}`);
        }
        scheduleNext(500); return;
      }
      if (showHeadliner) { setShowHeadliner(null); scheduleNext(300); return; }
      if (showBookedArtist) { setShowBookedArtist(null); scheduleNext(300); return; }
      if (showCouncilFame) { setShowCouncilFame(null); scheduleNext(300); return; }
      
      // AI: handle pending agent artist booking
      if (pendingAgentArtist) {
        const pa = pendingAgentArtist;
        const pd2 = playerData[pa.pid] || {};
        const openStages = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
        if (openStages.length > 0) {
          const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
          if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
          bookArtistToStage(pa.artist, openStages[0], pa.pid);
          exhaustAgent(pa.pid);
          addLog("🕵️ AI Agent", `Booked ${pa.artist.name} (agent claim)`);
        }
        setPendingAgentArtist(null);
        setTimeout(() => recalcTickets(), 50);
        scheduleNext(300); return;
      }

      if (noTurnsLeft || actionTaken) {
        // AI: deploy agent before ending turn (free action)
        if (hasAgent(currentPlayerId) && !actionTaken) {
          // Don't deploy if turn is ending due to no turns left and no action taken — weird state
        } else if (hasAgent(currentPlayerId)) {
          aiDeployAgent(currentPlayerId);
        }
        endTurn(); aiProcessing.current = false; return;
      }

      // Decide and execute ONE action
      const pd = playerData[currentPlayerId] || {};
      const decision = aiDecideTurn(pd, artistPool, dice, year);
      addLog("🤖 AI", `${currentPlayer?.festivalName} decides: ${decision.action}`);

      if (decision.action === "book") {
        const { source, artistIdx, stageIdx } = decision;
        let artist = null;
        if (source === "hand" && artistIdx < (pd.hand || []).length) {
          artist = pd.hand[artistIdx];
          setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(artistIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
        }
        if (artist) {
          bookArtistToStage(artist, stageIdx, currentPlayerId);
          setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
          setActionTaken(true);
          addLog("🤖 AI", `Booked ${artist.name}`);
        } else {
          addLog("🤖 AI", "Booking failed — fallback to amenity");
          const cd2 = dice.length > 0 ? dice : rollDice();
          if (cd2.length > 0) {
            const pk = aiPickDie(cd2, pd, null);
            const nd2 = [...cd2]; nd2.splice(pk.idx, 1); setDice(nd2);
            if (pk.type === "fame") {
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
            } else {
              const pos2 = aiFindPlacement(pd);
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col: pos2.col, row: pos2.row, type: pk.type }] } }));
            }
            setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
          }
        }
        scheduleNext(800); return;
      }
      if (decision.action === "reserve" || decision.action === "drawDeck") {
        // AI Draw 2: pick best combo from pool + deck
        const protectedNames = getAgentProtectedNames();
        const pickable = artistPool.filter(a => !protectedNames.has(a.name));
        const drawn = [];
        
        // Strategy: take best from pool, then best from remaining pool or deck
        if (pickable.length >= 2) {
          const sorted = [...pickable].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets));
          const deckTop = artistDeck.length > 0 ? artistDeck[artistDeck.length - 1] : null;
          // Compare: 2 pool vs 1 pool + 1 deck
          const twoPoolVal = sorted[0].vp + sorted[0].tickets + sorted[1].vp + sorted[1].tickets;
          const mixedVal = sorted[0].vp + sorted[0].tickets + (deckTop ? deckTop.vp + deckTop.tickets : 0);
          if (twoPoolVal >= mixedVal) {
            drawn.push(sorted[0], sorted[1]);
            const newPool = artistPool.filter(a => a !== sorted[0] && a !== sorted[1]);
            setArtistPool(newPool);
          } else {
            drawn.push(sorted[0]);
            setArtistPool(artistPool.filter(a => a !== sorted[0]));
            const deckDrawn = drawFromDeck(1);
            if (deckDrawn.length > 0) drawn.push(deckDrawn[0]);
          }
        } else if (pickable.length === 1) {
          drawn.push(pickable[0]);
          setArtistPool(artistPool.filter(a => a !== pickable[0]));
          const deckDrawn = drawFromDeck(1);
          if (deckDrawn.length > 0) drawn.push(deckDrawn[0]);
        } else {
          // No pickable pool artists — draw 2 from deck
          const deckDrawn = drawFromDeck(2);
          drawn.push(...deckDrawn);
        }
        
        if (drawn.length > 0) {
          setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, ...drawn] } }));
          addLog("🤖 AI", `Drew ${drawn.map(a => a.name).join(" + ")} (${drawn.length} artists)`);
        }
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        refillPool();
        scheduleNext(500); return;
      }
      // Default: pick amenity directly (skip the multi-step UI)
      let currentDice = dice.length > 0 ? dice : rollDice();
      if (dice.length === 0 && currentDice.length > 0) {
        setDice(currentDice);
      }
      if (currentDice.length === 0) { endTurn(); aiProcessing.current = false; return; }
      const pick = aiPickDie(currentDice, pd, decision.preferredType);
      const dieVal = currentDice[pick.idx];

      if (dieVal === "fame" || pick.type === "fame") {
        // Fame die
        const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
        setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
        addLog("🤖 AI", `Rolled 🔥 Fame!`);
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        scheduleNext(500); return;
      }

      // Resolve die to amenity type — use the AI's preferred type for OR dice
      let amenityType = pick.type || dieVal;
      if (dieVal === "catering_or_portaloo") amenityType = pick.type || "catering";
      else if (dieVal === "security_or_campsite") amenityType = pick.type || "security";

      // Remove die, place amenity directly
      const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
      const pos = aiFindPlacement(pd);
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col: pos.col, row: pos.row, type: amenityType }] } }));
      addLog("🤖 AI", `Placed ${AMENITY_LABELS[amenityType]}`);
      checkSecurityVPBonus(currentPlayerId, amenityType);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
      setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      scheduleNext(500); return;
    }

    aiProcessing.current = false;
  };

  // Trigger AI when it's an AI player's turn
  useEffect(() => {
    if (!isCurrentPlayerAI()) { aiProcessing.current = false; return; }
    // Safety: reset processing flag if somehow stuck
    const safetyTimer = setTimeout(() => { aiProcessing.current = false; }, 5000);
    if (aiProcessing.current) return;
    aiTimer.current = setTimeout(() => aiStep(), 700);
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); clearTimeout(safetyTimer); };
  }, [phase, setupStep, setupIndex, currentPlayerIdx, showTurnStart, actionTaken, noTurnsLeft, pendingEffect, pendingDiceRoll, showHeadliner, showBookedArtist, showCouncilFame, showYearAnnouncement]);

  // ═══════════════════════════════════════════════════════════
  // TURN ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handlePickAmenity = () => { setTurnAction("pickAmenity"); if (dice.length === 0) setDice(rollDice()); };
  const handleDiePick = (idx, dv) => {
    takeUndoSnapshot();
    if (dv === "fame") {
      // Fame die: gain +1 Fame this round, use turn, no placement
      const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
      addLog(currentPlayer.festivalName, `rolled 🔥 Fame! +1 Fame this year`);
      trackGoalProgress(currentPlayerId, "fameDieRolls");
      showFloatingBonus("+1 🔥 Fame!", "#f97316");
      sfx.gainFame();
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      return;
    }
    if (dv === "catering_or_portaloo" || dv === "security_or_campsite") { setSelectedDie(idx); setChoiceAmenity(dv); }
    else { const nd = [...dice]; nd.splice(idx, 1); setDice(nd); setPlacingAmenity(dv); setSelectedDie(null); setChoiceAmenity(null); }
  };
  const handleChoiceSelect = (type) => { const nd = [...dice]; nd.splice(selectedDie, 1); setDice(nd); setPlacingAmenity(type); setSelectedDie(null); setChoiceAmenity(null); };
  const handleRerollDice = () => {
    setDice(rollDice());
    addLog("Dice", "Rerolled all amenity dice");
  };
  const handleMoveAmenity = () => { takeUndoSnapshot(); setTurnAction("moveAmenity"); setMovingFrom(null); };
  const handleArtistAction = () => { takeUndoSnapshot(); setTurnAction("artist"); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null); };

  const handleGameHexClick = (col, row) => {
    if (actionTaken) return;
    if (turnAction === "pickAmenity" && placingAmenity) {
      if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row)) return;
      recalcAfterUpdate(currentPlayerId, pd => ({ ...pd, amenities: [...pd.amenities, { col, row, type: placingAmenity }] }));
      addLog(currentPlayer.festivalName, `placed ${AMENITY_LABELS[placingAmenity]} at (${col},${row})`);
      checkSecurityVPBonus(currentPlayerId, placingAmenity);
      sfx.placeAmenity();
      setPlacingAmenity(null); setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true);
    } else if (turnAction === "moveAmenity") {
      if (!movingFrom) { const am = currentPD.amenities.find(a => a.col === col && a.row === row); if (am) setMovingFrom({ col, row, type: am.type }); }
      else {
        if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row && !(a.col === movingFrom.col && a.row === movingFrom.row))) return;
        recalcAfterUpdate(currentPlayerId, pd => { const na = pd.amenities.filter(a => !(a.col === movingFrom.col && a.row === movingFrom.row)); na.push({ col, row, type: movingFrom.type }); return { ...pd, amenities: na }; });
        addLog(currentPlayer.festivalName, `moved ${AMENITY_LABELS[movingFrom.type]} to (${col},${row})`);
        setMovingFrom(null); setMovedThisTurn(true); setTurnAction(null); setTimeout(() => recalcTickets(), 50);
      }
    }
  };

  /** Take a full undo snapshot of all mutable game state */
  const takeUndoSnapshot = () => {
    setUndoSnapshot({
      playerData: JSON.parse(JSON.stringify(playerData)),
      dice: [...dice],
      turnsLeft: { ...turnsLeft },
      artistPool: JSON.parse(JSON.stringify(artistPool)),
      artistDeck: JSON.parse(JSON.stringify(artistDeck)),
      discardPile: JSON.parse(JSON.stringify(discardPile)),
      microtrends: JSON.parse(JSON.stringify(microtrends)),
      goalProgress: JSON.parse(JSON.stringify(goalProgress)),
      goalReq1Claimed: JSON.parse(JSON.stringify(goalReq1Claimed)),
      activeGoals: JSON.parse(JSON.stringify(activeGoals)),
      goalClaimsRef: { ...goalClaimsRef.current },
      playerCouncils: JSON.parse(JSON.stringify(playerCouncils)),
      councilDeck: JSON.parse(JSON.stringify(councilDeck)),
      playerPersonalEvents: JSON.parse(JSON.stringify(playerPersonalEvents)),
      globalEvents: JSON.parse(JSON.stringify(globalEvents)),
    });
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setPlayerData(undoSnapshot.playerData);
    setDice(undoSnapshot.dice);
    setTurnsLeft(undoSnapshot.turnsLeft);
    setArtistPool(undoSnapshot.artistPool);
    setArtistDeck(undoSnapshot.artistDeck);
    setDiscardPile(undoSnapshot.discardPile);
    setMicrotrends(undoSnapshot.microtrends);
    if (undoSnapshot.goalProgress) setGoalProgress(undoSnapshot.goalProgress);
    if (undoSnapshot.goalReq1Claimed) setGoalReq1Claimed(undoSnapshot.goalReq1Claimed);
    if (undoSnapshot.activeGoals) setActiveGoals(undoSnapshot.activeGoals);
    if (undoSnapshot.goalClaimsRef) goalClaimsRef.current = undoSnapshot.goalClaimsRef;
    if (undoSnapshot.playerCouncils) setPlayerCouncils(undoSnapshot.playerCouncils);
    if (undoSnapshot.councilDeck) setCouncilDeck(undoSnapshot.councilDeck);
    if (undoSnapshot.playerPersonalEvents) setPlayerPersonalEvents(undoSnapshot.playerPersonalEvents);
    if (undoSnapshot.globalEvents) setGlobalEvents(undoSnapshot.globalEvents);
    setActionTaken(false);
    setTurnAction(null);
    setPlacingAmenity(null);
    setMovingFrom(null);
    setMovedThisTurn(false);
    setSelectedArtist(null);
    setArtistAction(null);
    setPendingEffect(null);
    setPendingEffectPid(null);
    setCouncilChoiceOptions(null);
    setPendingPortalooRefresh(0);
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName, "↩️ Undid last action");
    setTimeout(() => recalcTickets(), 50);
  };

  // ─── Artist booking/reserving ───
  const handleBookFromPool = (idx) => {
    const artist = artistPool[idx];
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "pool", poolIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromHand = (idx) => {
    const artist = currentPD.hand[idx];
    if (!canAffordArtistOrFree(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "hand", handIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromDiscard = () => {
    if (discardPile.length === 0) return;
    const artist = discardPile[discardPile.length - 1]; // top of discard
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "discard", discardIdx: discardPile.length - 1 }); setArtistAction("pickStage");
  };
  const handleReserveFromPool = (idx) => {
    const artist = artistPool[idx];
    const newPool = [...artistPool]; newPool.splice(idx, 1);
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
    setArtistPool(newPool);
    addLog(currentPlayer.festivalName, `picked up ${artist.name} from pool`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    setTimeout(() => recalcTickets(), 50);
  };

  // ── DRAW 2 FLOW ──
  const startDraw2 = () => {
    setDraw2Picks([]);
    setDraw2DeckCard(null);
    setArtistAction("draw2");
  };
  const draw2PickFromPool = (idx) => {
    const artist = artistPool[idx];
    const newPool = [...artistPool]; newPool.splice(idx, 1);
    setArtistPool(newPool);
    const newPicks = [...draw2Picks, artist];
    setDraw2Picks(newPicks);
    addLog(currentPlayer.festivalName, `drew ${artist.name} from pool (${newPicks.length}/2)`);
    if (newPicks.length >= 2) finishDraw2(newPicks);
  };
  const draw2PickFromDeck = () => {
    const drawn = drawFromDeck(1);
    if (drawn.length === 0) { addLog("Deck", "No artists left!"); return; }
    // Drawing from deck = no undo (hidden information revealed)
    setUndoSnapshot(null);
    setDraw2DeckCard(drawn[0]);
  };
  const draw2ConfirmDeck = () => {
    if (!draw2DeckCard) return;
    const newPicks = [...draw2Picks, draw2DeckCard];
    setDraw2Picks(newPicks);
    addLog(currentPlayer.festivalName, `drew ${draw2DeckCard.name} from deck (${newPicks.length}/2)`);
    setDraw2DeckCard(null);
    if (newPicks.length >= 2) finishDraw2(newPicks);
  };
  const draw2RejectDeck = () => {
    // Put card back on top of deck
    if (draw2DeckCard) setArtistDeck(prev => [...prev, draw2DeckCard]);
    setDraw2DeckCard(null);
  };
  const finishDraw2 = (picks) => {
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, ...picks] } }));
    picks.forEach(() => trackGoalProgress(currentPlayerId, "artistsSigned"));
    setDraw2Picks([]); setDraw2DeckCard(null);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    setTimeout(() => recalcTickets(), 50);
  };
  const handleReserveFromDeck = () => {
    // Draw 2 cards from deck
    const drawn = drawFromDeck(2);
    if (drawn.length === 0) { addLog("Deck", "No artists left to draw!"); return; }
    setDeckDrawnCard(drawn); // store array of 2 (or 1 if deck low)
    setDeckCardRevealed(false);
    setArtistAction("deckReveal");
  };
  const handleRevealDeckCard = () => { setDeckCardRevealed(true); };
  const handlePickDeckCard = (keepIdx) => {
    // Player picks which of the 2 drawn cards to keep
    const drawn = Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard];
    const kept = drawn[keepIdx];
    const other = drawn.length > 1 ? drawn[1 - keepIdx] : null;
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, kept] } }));
    addLog(currentPlayer.festivalName, `drew ${kept.name} from deck`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    if (other && artistPool.length >= 1) {
      // Player must swap the unchosen card into a pool slot
      setDeckDrawnCard(other); // store the unchosen card
      setArtistAction("deckSwapPool"); // new step: pick which pool artist to replace
    } else if (other) {
      // Pool is empty — just add the other card to pool
      setArtistPool(prev => [...prev, other]);
      setDeckDrawnCard(null); setDeckCardRevealed(false);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    } else {
      // Only drew 1 card (deck was low)
      setDeckDrawnCard(null); setDeckCardRevealed(false);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    }
    setTimeout(() => recalcTickets(), 50);
  };
  const handleDeckSwapPool = (poolIdx) => {
    // Swap the unchosen deck card into the pool, discarding the pool artist it replaces
    const unchosen = Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard;
    const replaced = artistPool[poolIdx];
    const newPool = [...artistPool];
    newPool[poolIdx] = unchosen;
    setArtistPool(newPool);
    setDiscardPile(prev => [...prev, replaced]);
    addLog(currentPlayer.festivalName, `swapped ${unchosen.name} into pool, discarded ${replaced.name}`);
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleConfirmDeckReserve = () => {
    // Legacy fallback — single card confirm (used by effects)
    const card = Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard;
    if (!card) return;
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, card] } }));
    addLog(currentPlayer.festivalName, `reserved ${card.name} from deck`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleStageSelect = (stageIdx) => {
    if (!selectedArtist) return;
    const { artist, source, poolIdx, handIdx, discardIdx } = selectedArtist;
    // Remove from source
    if (source === "pool") {
      const newPool = [...artistPool]; newPool.splice(poolIdx, 1); setArtistPool(newPool);
      // Pool does NOT auto-refresh anymore
    } else if (source === "hand") {
      setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(handIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
    }
    bookArtistToStage(artist, stageIdx, currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
  };

  // ═══════════════════════════════════════════════════════════
  // END TURN / ROUND END
  // ═══════════════════════════════════════════════════════════
  const endTurn = () => {
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName || "?", "ended their turn");
    setTurnAction(null); setPlacingAmenity(null); setMovingFrom(null); setMovedThisTurn(false); setSelectedDie(null); setChoiceAmenity(null); setActionTaken(false); setArtistAction(null); setSelectedArtist(null); setShowHand(false); setDeckDrawnCard(null); setDeckCardRevealed(false); setViewingPlayerId(null);
    setPendingEffect(null); setPendingEffectPid(null); setPendingDiceRoll(null);

    // Evaluate council objectives for current player before moving on
    evaluateCouncils(currentPlayerId);

    const findNext = () => {
      for (let i = currentPlayerIdx + 1; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      for (let i = 0; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      return -1;
    };
    const ni = findNext();
    if (ni < 0) { beginSpecialGuestPhase(); return; }

    // Refill pool to 5 before next player's turn
    refillPool();

    setCurrentPlayerIdx(ni);
    const np = players.find(p => p.id === turnOrder[ni]);
    addLogH(`${np?.festivalName || "?"}'s Turn`, "turn");
    setShowTurnStart(true);
  };

  /** Evaluate all council objectives for a player, update active states, grant first-time fame */
  function evaluateCouncils(pid) {
    setTimeout(() => recalcTickets(), 50); // councils are always active, just recalc benefits
  }

  /** Start the events phase — resolve events for each player */
  /** Start the Special Guest phase — check each player for eligible stages */
  const beginSpecialGuestPhase = () => {
    addLogH(`Year ${year} — Special Guests`, "round");
    setSpecialGuestPlayer(0);
    setSpecialGuestCard(null);
    setSpecialGuestEligible([]);
    setPhase("specialGuest");
  };

  /** Check if a player qualifies for a special guest and set up their turn */
  function setupSpecialGuestForPlayer(pIdx) {
    const p = players[pIdx];
    if (!p) { beginYearEndEffectsPhase(); return; }
    const pd = playerData[p.id] || {};
    const sa = pd.stageArtists || [];
    // Find stages with exactly 2 artists (2/3 full)
    const eligible = [];
    sa.forEach((s, i) => { if (s.length === 2) eligible.push(i); });
    if (eligible.length === 0) {
      addLog("🌟 Special Guest", `${p.festivalName} has no qualifying stages.`);
      // Move to next player
      if (pIdx < players.length - 1) {
        setSpecialGuestPlayer(pIdx + 1);
        setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100);
      } else {
        beginYearEndEffectsPhase();
      }
      return;
    }
    // Draw from deck
    const drawn = drawFromDeck(1);
    if (drawn.length === 0) {
      addLog("🌟 Special Guest", `Deck empty — no special guest available.`);
      if (pIdx < players.length - 1) { setSpecialGuestPlayer(pIdx + 1); setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100); }
      else beginYearEndEffectsPhase();
      return;
    }
    setSpecialGuestCard(drawn[0]);
    setSpecialGuestEligible(eligible);
    setSpecialGuestPlayer(pIdx);
  }

  /** Check if player can afford the special guest (ignoring fame requirement) */
  function canAffordSpecialGuest(artist, pd) {
    const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
    (pd.amenities || []).forEach(a => counts[a.type]++);
    return counts.campsite >= (artist.campCost || 0) &&
      counts.security >= (artist.securityCost || 0) &&
      counts.catering >= (artist.cateringCost || 0) &&
      counts.portaloo >= (artist.portalooCost || 0);
  }

  /** Place special guest on a stage — no headliner effect, just tickets */
  function placeSpecialGuest(stageIdx) {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (!p || !artist) return;
    // Add artist to stage as 3rd slot (headliner position) but without double effect
    setPlayerData(prev => {
      const pd = { ...prev[p.id] };
      const sa = [...(pd.stageArtists || [])];
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      pd.stageArtists = sa;
      return { ...prev, [p.id]: pd };
    });
    const sName = (playerData[p.id]?.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    addLog("🌟 Special Guest", `${artist.name} appears as special guest at ${p.festivalName}'s ${sName}! +${artist.tickets} 🎟️`);
    showFloatingBonus(`🌟 ${artist.name}!`, "#fbbf24");
    showFloatingBonus(`+${artist.tickets} 🎟️`, "#4ade80");
    setSpecialGuestCard(null);
    setTimeout(() => recalcTickets(), 50);
    // Advance to next player
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 600);
    } else {
      setTimeout(() => beginYearEndEffectsPhase(), 600);
    }
  }

  function declineSpecialGuest() {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (artist) {
      setDiscardPile(prev => [...prev, artist]);
      addLog("🌟 Special Guest", `${p?.festivalName} declined ${artist.name}.`);
    }
    setSpecialGuestCard(null);
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 300);
    } else {
      setTimeout(() => beginYearEndEffectsPhase(), 300);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // YEAR-END EFFECTS PHASE (interactive, before events)
  // ═══════════════════════════════════════════════════════════
  const beginYearEndEffectsPhase = () => {
    // Clear all agents — they don't carry over between years
    setAgentPlacements({});
    setAgentExhausted({});
    setPendingAgentAmenity([]);
    setPendingAgentArtist(null);
    setAgentContest(null);
    addLog("🕵️ Agents", "All agents recalled — year end");
    
    // Evaluate councils first so ticket counts are final
    players.forEach(p => evaluateCouncils(p.id));
    // Gather all year-end effects for all players
    const allEffects = {};
    let anyEffects = false;
    players.forEach(p => {
      const pd = playerData[p.id];
      if (!pd) return;
      const effects = [];
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => {
        const eff = (a.effect || "").toLowerCase();
        if (!eff.includes("year end")) return;
        const rawEff = a.effect || "";
        if (eff.includes("roll all") && eff.includes("unique amenity")) {
          effects.push({ artist: a, type: "rollUnique", desc: "Roll all 5 dice — +1 VP per unique amenity" });
        } else if (eff.includes("roll all") && eff.includes("most common")) {
          effects.push({ artist: a, type: "rollCommon", desc: "Roll all 5 dice — +1 VP per most common result" });
        } else if (eff.includes("vp / fame gained")) {
          effects.push({ artist: a, type: "fameVP", desc: `+1 VP per Fame gained (${pd.baseFame || 0} Fame)`, autoVP: pd.baseFame || 0 });
        } else if (eff.includes("vp if you have the highest fame")) {
          const myFame = pd.fame || 0; const myTickets = pd.tickets || 0;
          const isHighestFame = players.every(op => op.id === p.id || (playerData[op.id]?.fame || 0) <= myFame);
          if (isHighestFame) {
            const isHighestTickets = players.every(op => op.id === p.id || (playerData[op.id]?.tickets || 0) <= myTickets);
            const bonus = isHighestTickets ? 4 : 1;
            effects.push({ artist: a, type: "autoVP", desc: `Highest Fame${isHighestTickets ? " + most tickets" : ""} → +${bonus} VP`, autoVP: bonus });
          }
        } else if (eff.includes("vp / 3 amenities")) {
          const amVP = Math.floor((pd.amenities || []).length / 3);
          if (amVP > 0) effects.push({ artist: a, type: "autoVP", desc: `${(pd.amenities||[]).length} amenities / 3 = +${amVP} VP`, autoVP: amVP });
        } else if (eff.includes("vp / council objective")) {
          const activeCount = (playerCouncils[p.id] || []).filter(co => { try { return evalCouncilObjective(co.obj, pd, false).count > 0; } catch(e) { return false; } }).length;
          if (activeCount > 0) effects.push({ artist: a, type: "autoVP", desc: `${activeCount} active council${activeCount>1?"s":""} = +${activeCount} VP`, autoVP: activeCount });
        } else if (eff.includes("1vp per existing campsite") || eff.includes("1 vp per existing campsite")) {
          const camps = (pd.amenities || []).filter(am => am.type === "campsite").length;
          if (camps > 0) effects.push({ artist: a, type: "autoVP", desc: `${camps} campsite${camps>1?"s":""} = +${camps} VP`, autoVP: camps });
        } else if (eff.includes("vp / hip hop artist")) {
          const hhCount = (pd.stageArtists || []).flat().filter(ba => ba.genre && ba.genre.includes("Hip Hop")).length;
          if (hhCount > 0) effects.push({ artist: a, type: "autoVP", desc: `${hhCount} Hip Hop artist${hhCount>1?"s":""} = +${hhCount} VP`, autoVP: hhCount });
        } else {
          // Generic year-end: -VP / sell tickets
          const vpLoss = rawEff.match(/Year End:.*-(\d+)\s*VP/i);
          const sellTix = rawEff.match(/Year End:.*[Ss]ell\s+(\d+)\s+tickets?/i);
          if (vpLoss || sellTix) {
            const vp = vpLoss ? -parseInt(vpLoss[1]) : 0;
            const tix = sellTix ? parseInt(sellTix[1]) : 0;
            effects.push({ artist: a, type: "autoVPTix", desc: `${vpLoss ? `-${vpLoss[1]} VP` : ""}${vpLoss && sellTix ? " / " : ""}${sellTix ? `+${sellTix[1]} tickets` : ""}`, autoVP: vp, autoTix: tix });
          }
        }
      }));
      allEffects[p.id] = effects;
      if (effects.length > 0) anyEffects = true;
    });

    if (!anyEffects) {
      // Skip straight to events
      beginEventPhase();
      return;
    }

    // Store effects and start phase
    setYearEndEffectsList(allEffects);
    setYearEndEffectsPlayer(0);
    setYearEndEffectIdx(0);
    setYearEndDiceRoll(null);
    setPhase("yearEndEffects");
  };

  const resolveYearEndEffect = (result) => {
    try {
      const pid = players[yearEndEffectsPlayer]?.id;
      const effects = yearEndEffectsList[pid] || [];
      const effect = effects[yearEndEffectIdx];
      if (!effect || !pid) { advanceYearEndEffect(); return; }

      // Apply the result
      if (effect.type === "autoVP" || effect.type === "fameVP") {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: Math.max(0, (p[pid].vp || 0) + (effect.autoVP || 0)) } }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${effect.autoVP} VP`);
      } else if (effect.type === "autoVPTix") {
        setPlayerData(p => ({
          ...p, [pid]: {
            ...p[pid],
            vp: Math.max(0, (p[pid].vp || 0) + (effect.autoVP || 0)),
            bonusTickets: (p[pid].bonusTickets || 0) + (effect.autoTix || 0)
          }
        }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → ${effect.desc}`);
      } else if (effect.type === "rollUnique" || effect.type === "rollCommon") {
        if (result?.vp) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + result.vp } }));
          addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${result.vp} VP`);
        }
      }

      // Advance to next effect or next player
      advanceYearEndEffect();
    } catch (err) {
      console.error("resolveYearEndEffect error:", err);
      advanceYearEndEffect();
    }
  };

  const advanceYearEndEffect = () => {
    try {
      const pid = players[yearEndEffectsPlayer]?.id;
      const effects = yearEndEffectsList[pid] || [];
      if (yearEndEffectIdx < effects.length - 1) {
        setYearEndEffectIdx(yearEndEffectIdx + 1);
        setYearEndDiceRoll(null);
      } else {
        // Next player with effects
        let nextPlayer = yearEndEffectsPlayer + 1;
        while (nextPlayer < players.length && (yearEndEffectsList[players[nextPlayer]?.id] || []).length === 0) nextPlayer++;
        if (nextPlayer < players.length) {
          setYearEndEffectsPlayer(nextPlayer);
          setYearEndEffectIdx(0);
          setYearEndDiceRoll(null);
        } else {
          // All done — go to events
          setTimeout(() => { try { recalcTickets(); beginEventPhase(); } catch(e) { console.error("beginEventPhase error:", e); setPhase("game"); } }, 100);
        }
      }
    } catch (err) {
      console.error("advanceYearEndEffect error:", err);
      // Force progression to events phase
      setTimeout(() => { try { beginEventPhase(); } catch(e) { console.error("forced beginEventPhase error:", e); } }, 100);
    }
  };

  const beginEventPhase = () => {
    // Evaluate councils before events so ticket counts are final  
    players.forEach(p => evaluateCouncils(p.id));
    
    addLogH(`Year ${year} — Events Phase`, "round");
    
    // Draw personal events for each player: 3 base + 1 per open stage
    let eDk = [...eventDeck];
    if (eDk.length < players.length * 6) eDk = shuffle([...ALL_EVENTS]); // reshuffle if low
    
    const results = {};
    players.forEach(p => {
      const pd = playerData[p.id];
      const stageCount = (pd.stages || []).length;
      const drawCount = 3 + stageCount;
      const drawn = eDk.splice(0, Math.min(drawCount, eDk.length));
      // Add any personal events gained from artist effects during the year
      const personalExtra = playerPersonalEvents[p.id] || [];
      const allDrawn = [...drawn, ...personalExtra];
      
      // Filter to events whose conditions are met
      const positive = allDrawn.filter(e => e.color === "green" && eventConditionMet(e, pd));
      const negativeAll = allDrawn.filter(e => e.color === "red" && eventConditionMet(e, pd));
      const secCount = (pd.amenities || []).filter(a => a.type === "security").length;
      
      results[p.id] = { positive, negativeAll, blocked: [], negative: negativeAll, secCount, totalNeg: negativeAll.length, allDrawn };
      addLog(p.festivalName, `Drew ${drawCount} events${personalExtra.length > 0 ? ` + ${personalExtra.length} bonus` : ""} (${positive.length} 🟢, ${negativeAll.length} 🔴)`);
    });
    setEventDeck(eDk);
    setEventPhaseResults(results);
    setEventPhasePlayer(0);
    setEventPhaseStep("delegate");
    setSecurityDelegation(0);
    setPhase("events");
  };

  /** Player confirms security delegation — resolve which events are blocked */
  function confirmSecurityDelegation() {
    const pid = players[eventPhasePlayer]?.id;
    console.log("confirmSecurityDelegation called, player:", eventPhasePlayer, "pid:", pid);
    if (pid === undefined || pid === null || !eventPhaseResults) {
      console.error("confirmSecurityDelegation bailing:", { pid, hasResults: !!eventPhaseResults });
      // Force to results step anyway
      setEventPhaseStep("results");
      return;
    }
    const res = { ...eventPhaseResults[pid] };
    if (!res.negativeAll) res.negativeAll = [];
    if (!res.positive) res.positive = [];
    if (!res.blocked) res.blocked = [];
    const delegated = securityDelegation;
    // Remove delegated security from player board
    if (delegated > 0) {
      setPlayerData(p => {
        const ams = [...(p[pid].amenities || [])];
        let removed = 0;
        for (let i = ams.length - 1; i >= 0 && removed < delegated; i--) {
          if (ams[i].type === "security") { ams.splice(i, 1); removed++; }
        }
        return { ...p, [pid]: { ...p[pid], amenities: ams } };
      });
      addLog(players.find(p => p.id === pid)?.festivalName, `Delegated ${delegated} 👮‍♀️ security to block events (removed from board)`);
    }
    // Apply blocking — each security blocks 2 negative events
    const eventsBlocked = Math.min(delegated * 2, res.negativeAll.length);
    res.blocked = res.negativeAll.slice(0, eventsBlocked);
    res.negative = res.negativeAll.slice(eventsBlocked);
    // Track goal progress for each blocked event
    for (let i = 0; i < eventsBlocked; i++) trackGoalProgress(pid, "eventsBlocked");
    // Create entirely new results object to ensure React detects the change
    const newResults = { ...eventPhaseResults, [pid]: { ...res } };
    setEventPhaseResults(newResults);
    setEventPhaseStep("results");
  }

  /** Apply resolved events to a player's data */
  function applyEventsForPlayer(pid) {
    const res = eventPhaseResults?.[pid];
    if (!res) return;
    const pd = playerData[pid];
    const activeCouncilCount = (playerCouncils[pid] || []).filter(co => { try { return evalCouncilObjective(co.obj, pd, false).count > 0; } catch(e) { return false; } }).length;
    const ctx = { activeCouncilCount };
    res.positive.forEach(evt => {
      try {
        const fx = evt.apply(pd, ctx);
        if (fx.fame) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fx.fame) } }));
        if (fx.vp) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + fx.vp } }));
        if (fx.tickets) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fx.tickets } }));
        if (fx.drawArtist) {
          const drawn = drawFromDeck(fx.drawArtist);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
            addLog(players.find(p=>p.id===pid)?.festivalName, `Drew ${drawn.map(a=>a.name).join(", ")} from deck`);
          }
        }
        if (fx.drawCouncil) {
          const cd = [...councilDeck];
          if (cd.length > 0) {
            const newObj = cd.pop();
            const updated = { ...playerCouncilsRef.current };
            updated[pid] = [...(updated[pid] || []), { obj: newObj, active: true }];
            setPlayerCouncils(updated);
            playerCouncilsRef.current = updated;
            setCouncilDeck(cd);
            addLog(players.find(p=>p.id===pid)?.festivalName, `Drew council objective: ${newObj.name}`);
          }
        }
        addLog(players.find(p=>p.id===pid)?.festivalName, `🟢 ${evt.name}: ${evt.result}`);
      } catch(err) { console.error("Event apply error:", err); addLog("Event", `Error applying ${evt.name}`); }
    });
    res.negative.forEach(evt => {
      try {
        const fx = evt.apply(pd);
        if (fx.fame) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.max(0, (p[pid].baseFame || 0) + fx.fame) } }));
        if (fx.tickets) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fx.tickets } }));
        if (fx.vp) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + fx.vp } }));
        if (fx.removeAmenity) {
          setPlayerData(p => {
            const ams = [...(p[pid].amenities || [])];
            const idx = ams.findIndex(a => a.type === fx.removeAmenity);
            if (idx >= 0) ams.splice(idx, 1);
            return { ...p, [pid]: { ...p[pid], amenities: ams } };
          });
        }
        if (fx.removeAmenityCount) {
          setPlayerData(p => {
            const ams = [...(p[pid].amenities || [])];
            let removed = 0;
            for (let i = ams.length - 1; i >= 0 && removed < fx.removeAmenityCount.count; i--) {
              if (ams[i].type === fx.removeAmenityCount.type) { ams.splice(i, 1); removed++; }
            }
            return { ...p, [pid]: { ...p[pid], amenities: ams } };
          });
        }
        if (fx.discardHand) {
          setPlayerData(p => {
            const h = [...(p[pid].hand || [])];
            const removed = h.splice(0, fx.discardHand);
            setDiscardPile(prev => [...prev, ...removed]);
            return { ...p, [pid]: { ...p[pid], hand: h } };
          });
        }
        addLog(players.find(p=>p.id===pid)?.festivalName, `🔴 ${evt.name}: ${evt.result}`);
      } catch(err) { console.error("Event apply error:", err); addLog("Event", `Error applying ${evt.name}`); }
    });
    res.blocked.forEach(evt => {
      addLog(players.find(p=>p.id===pid)?.festivalName, `🛡️ Blocked: ${evt.name} (security)`);
    });
  }

  const advanceEventPhase = () => {
    try {
      const pid = players[eventPhasePlayer]?.id;
      console.log("advanceEventPhase called, player:", eventPhasePlayer, "pid:", pid, "total players:", players.length);
      if (pid !== undefined) {
        try { applyEventsForPlayer(pid); } catch(e) { console.error("applyEventsForPlayer crashed:", e); }
      }
      if (eventPhasePlayer < players.length - 1) {
        const next = eventPhasePlayer + 1;
        console.log("Advancing to next event player:", next);
        setEventPhasePlayer(next);
        setEventPhaseStep("delegate");
        setSecurityDelegation(0);
      } else {
        console.log("Last player done, going to beginRoundEnd");
        setTimeout(() => beginRoundEnd(), 100);
      }
    } catch(err) {
      console.error("advanceEventPhase error:", err);
      if (eventPhasePlayer < players.length - 1) {
        setEventPhasePlayer(eventPhasePlayer + 1);
        setEventPhaseStep("delegate");
        setSecurityDelegation(0);
      } else {
        setTimeout(() => beginRoundEnd(), 100);
      }
    }
  };

  const beginRoundEnd = () => {
    try {
    // Collect all data BEFORE any setState
    const logs = [];
    const nat = { ...allTickets };
    // Use current playerData snapshot for calculations
    const snap = JSON.parse(JSON.stringify(playerData));
    
    for (const p of players) {
      const pd = snap[p.id];
      if (!pd) continue;
      let vpBonus = 0;
      // Recalculate tickets
      let t = (pd.amenities || []).filter(a => a.type === "campsite").length * 2;
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets || 0; }));
      t += pd.bonusTickets || 0;
      (playerCouncils[p.id] || []).forEach(co => { if (co.active) { try { t += calcCouncilBenefit(co.obj, pd, false).tickets; } catch(e){} } });
      const computeFame = (pdata, tickets) => {
        let f = pdata.baseFame || 0;
        if (trendingCouncil) { const tb = evalCouncilObjective(trendingCouncil, pdata, true); if (tb.active && tb.fame > 0) f += tb.fame; }
        f += Math.floor((tickets || 0) / 10);
        return Math.min(FAME_MAX, f);
      };

      let rawT = t;
      const fame = computeFame(pd, rawT);
      // Artist VP
      let artistVP = 0;
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => { artistVP += a.vp || 0; }));
      vpBonus += artistVP;
      const fameVP = FAME_VP[Math.min(5, fame)] || 0;
      const ticketVP = Math.floor(rawT / 10);
      vpBonus += fameVP + ticketVP;
      // Council VP
      (playerCouncils[p.id] || []).forEach(co => { if (co.active) { try { vpBonus += calcCouncilBenefit(co.obj, pd, false).vp; } catch(e){} } });
      // Year-end artist effects are now applied in beginEventPhase (before events)
      // Only event-dependent effects remain here (Kendrick blocked/Eminem hit events)
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => {
        try {
          const eff = (a.effect || "").toLowerCase();
          if (eff.includes("vp / negative event avoided")) vpBonus += eventPhaseResults?.[p.id]?.blocked?.length || 0;
          if (eff.includes("vp / negative event that hit")) vpBonus += eventPhaseResults?.[p.id]?.negative?.length || 0;
        } catch(err) { /* skip */ }
      }));
      if (!nat[p.id]) nat[p.id] = {};
      // Recalculate ticket VP and fame after year-end effects may have modified rawT
      const finalTicketVP = Math.floor(rawT / 10);
      const finalFame = computeFame(pd, rawT);
      const finalFameVP = FAME_VP[Math.min(5, finalFame)] || 0;
      // Adjust vpBonus for any change in ticketVP and fameVP
      vpBonus += (finalTicketVP - ticketVP) + (finalFameVP - fameVP);
      nat[p.id][year] = { raw: rawT, fame: finalFame, fameVP: finalFameVP, ticketVP: finalTicketVP };
      logs.push({ type: "entry", who: p.festivalName, text: `🎟️ ${rawT}→${finalTicketVP}VP | 🔥${finalFame}→${finalFameVP}VP | Artists+${artistVP}VP` });
      // Store computed values back into snap for use by subsequent players (Lady Gaga comparison)
      snap[p.id] = { ...pd, tickets: rawT, rawTickets: rawT, fame: finalFame, vp: (pd.vp || 0) + vpBonus };
    }

    // Now do ALL setState calls at once — none nested inside each other
    setPlayerData(snap);
    setAllTickets(nat);
    logs.forEach(l => addLog(l.who, l.text));
    addLogH(`Year ${year} — Year End`, "round");
    setRevealIndex(0);
    setLeaderboardRevealed(false);
    setPhase("roundEnd");
    } catch(err) {
      console.error("beginRoundEnd error:", err);
      // Force phase transition even on error
      setRevealIndex(0); setLeaderboardRevealed(false); setPhase("roundEnd");
    }
  };

  const sortedPlayersForReveal = useMemo(() => [...players].sort((a, b) => (playerData[a.id]?.tickets || 0) - (playerData[b.id]?.tickets || 0)), [players, playerData]);
  const revealNext = () => { if (revealIndex < players.length - 1) setRevealIndex(revealIndex + 1); else setLeaderboardRevealed(true); };
  const proceedFromRoundEnd = () => {
    if (year >= 4) { setPhase("gameOver"); addLogH("Game Over!", "round"); return; }
    // Reset baseFame for all players at start of between-years phase
    // Any fame gained during pre-round (opening stages) will be preserved into the new year
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) { next[p.id] = { ...next[p.id], baseFame: 0 }; }
      return next;
    });
    setPreRoundIndex(0); setPreRoundStep("notify"); setDisplacedAmenities([]); setDisplacedPlaceIdx(0);
    setFreeAmenityCount(0); setFreeAmenityPlaced(0); setFreeAmenityType(null);
    setPhase("preRound");
  };

  // Pre-round — ALL players participate
  const preRoundPlayers = players; // everyone now
  const [freeAmenityCount, setFreeAmenityCount] = useState(0);
  const [freeAmenityPlaced, setFreeAmenityPlaced] = useState(0);
  const [freeAmenityType, setFreeAmenityType] = useState(null);
  const currentPreRoundPlayer = preRoundPlayers[preRoundIndex];
  const canOpenStage = currentPreRoundPlayer && (playerData[currentPreRoundPlayer.id]?.fame || 0) >= 3 && (playerData[currentPreRoundPlayer.id]?.stages || []).length < 3;

  const getPreRoundDrawCount = (pd) => {
    return (pd?.stages || []).length; // 1 draw per stage
  };

  const startPreRoundDraws = () => {
    const pd = playerData[currentPreRoundPlayer.id];
    const drawCount = getPreRoundDrawCount(pd);
    if (drawCount > 0) {
      setFreeAmenityCount(drawCount); setFreeAmenityPlaced(0); setFreeAmenityType(null);
      setPreRoundStep("preRoundDrawChoose");
    } else {
      nextPreRound();
    }
  };

  const acceptNewStage = () => { setPlacingStage(true); setPreRoundStep("placeStage"); };
  const declineNewStage = () => {
    addLog(currentPreRoundPlayer?.festivalName || "", "declined new stage");
    startPreRoundDraws();
  };
  const handlePreRoundHexClick = (col, row) => {
    if (!currentPreRoundPlayer) return; const pid = currentPreRoundPlayer.id; const pd = playerData[pid];
    if (preRoundStep === "placeStage") {
      if (!stageFullyInBounds(col, row) || stageWouldOverlap(col, row, pd.stages)) return;
      const sh = getStageHexes(col, row); const disp = pd.amenities.filter(a => sh.some(h => h.col === a.col && h.row === a.row));
      const rem = pd.amenities.filter(a => !sh.some(h => h.col === a.col && h.row === a.row));
      const usedN = pd.stageNames || [];
      const availN = STAGE_NAMES.filter(n => !usedN.includes(n));
      const sName = availN[Math.floor(Math.random() * availN.length)] || `Stage ${pd.stages.length + 1}`;
      const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
      setPlayerData(p => {
        const updPd = { ...p[pid] };
        updPd.stages = [...updPd.stages, { col, row }];
        updPd.stageArtists = [...(updPd.stageArtists || []), []];
        updPd.stageNames = [...(updPd.stageNames || []), sName];
        updPd.stageColors = [...(updPd.stageColors || []), sColor];
        updPd.amenities = rem;
        updPd.baseFame = Math.min(FAME_MAX, (updPd.baseFame || 0) + 1);
        return { ...p, [pid]: updPd };
      });
      if (disp.length > 0) { setDisplacedAmenities(disp); setDisplacedPlaceIdx(0); setPreRoundStep("moveDisplaced"); } else { setPreRoundStep("confirmStage"); }
      setPlacingStage(false); addLog(currentPreRoundPlayer.festivalName, `placed new stage → +1 🔥 Fame!`);
      showFloatingBonus("+1 🔥 New Stage!", "#f97316");
      setTimeout(() => recalcTickets(), 50);
    } else if (preRoundStep === "moveDisplaced") {
      const updPD = playerData[pid]; if (isOnStage(col, row, updPD.stages) || updPD.amenities.some(a => a.col === col && a.row === row)) return;
      const am = displacedAmenities[displacedPlaceIdx];
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: am.type }] } }));
      if (displacedPlaceIdx < displacedAmenities.length - 1) setDisplacedPlaceIdx(displacedPlaceIdx + 1); else setPreRoundStep("confirmStage");
    }
  };
  const confirmPreRoundStage = () => {
    // Stage was just placed — playerData might not have settled yet, so pass count explicitly
    const pd = playerData[currentPreRoundPlayer.id];
    const currentStages = (pd?.stages || []).length;
    // If we came from placeStage, the new stage is already in playerData from handlePreRoundHexClick
    // But React state might be stale — use at least currentStages (which should be updated)
    startPreRoundDraws();
  };
  const confirmPreRound = () => nextPreRound();
  const nextPreRound = () => {
    if (preRoundIndex < preRoundPlayers.length - 1) {
      setPreRoundIndex(preRoundIndex + 1); setPreRoundStep("notify"); setDisplacedAmenities([]); setDisplacedPlaceIdx(0);
      setFreeAmenityCount(0); setFreeAmenityPlaced(0); setFreeAmenityType(null);
    } else startNextYear();
  };

  const startNextYear = () => {
    const ny = year + 1; setYear(ny);
    // Apply artist objective rewards from last year's lineups (BEFORE clearing stages)
    applyObjectiveRewards();
    // Capture pre-round baseFame (from opening stages) BEFORE resetting
    const preRoundFame = {};
    players.forEach(p => { preRoundFame[p.id] = playerData[p.id]?.baseFame || 0; });
    // Clear all stages: move booked artists to discard pile, reset bonus tickets
    let newDiscard = [...discardPile];
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const allBooked = (pd.stageArtists || []).flat();
        newDiscard = [...newDiscard, ...allBooked];
        const emptyStages = (pd.stages || []).map(() => []);
        // Reset baseFame but preserve any fame gained during pre-round (stage opening)
        next[p.id] = { ...pd, stageArtists: emptyStages, bonusTickets: 0, baseFame: preRoundFame[p.id] || 0, vpPerSecurity: 0 };
      }
      return next;
    });
    setDiscardPile(newDiscard);
    addLog("🔄 New Year", "All stages cleared — artists moved to discard pile");

    // Deal a new council objective to every player at the start of each year
    const cd = [...councilDeck];
    const updatedCouncils = { ...playerCouncilsRef.current };
    players.forEach(p => {
      if (cd.length > 0) {
        const newObj = cd.pop();
        updatedCouncils[p.id] = [...(updatedCouncils[p.id] || []), { obj: newObj, active: true }];
        addLog("📋 Council", `${p.festivalName} receives new council objective: ${newObj.name}`);
      }
    });
    setPlayerCouncils(updatedCouncils);
    playerCouncilsRef.current = updatedCouncils;
    setCouncilDeck(cd);

    const sorted = [...players].sort((a, b) => (allTickets[a.id]?.[year] || 0) - (allTickets[b.id]?.[year] || 0));
    const no = sorted.map(p => p.id); setTurnOrder(no); setCurrentPlayerIdx(0);
    const tl = {}; no.forEach(id => { tl[id] = TURNS_PER_YEAR[ny]; }); setTurnsLeft(tl);
    setDice(rollDice()); setPhase("game"); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // No global events — personal events drawn at year end in beginEventPhase
    // New microtrends
    const mt = generateMicrotrends();
    setMicrotrends(mt);
    addLog("🎵 Microtrends", `Book a ${mt[0].genre} artist • Book a ${mt[1].genre} artist`);
    // Draw new trending council
    const tcPool = ALL_COUNCIL_OBJECTIVES.filter(c => c.id !== trendingCouncil?.id);
    const tc = tcPool[Math.floor(Math.random() * tcPool.length)] || ALL_COUNCIL_OBJECTIVES[0];
    setTrendingCouncil(tc); trendingCouncilRef.current = tc;
    addLog("📋 Trending Council", `${tc.name} — ${tc.tBenefit}`);
    // Delay recalcTickets so React flushes all state updates (playerData, trendingCouncil, etc.) first
    setTimeout(() => recalcTickets(), 50);
    addLogH(`Year ${ny} Begins`, "year");
    const fp = players.find(p => p.id === no[0]); if (fp) addLogH(`${fp.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  const winner = useMemo(() => {
    if (phase !== "gameOver") return null;
    return [...players].sort((a, b) => { const vd = (playerData[b.id]?.vp || 0) - (playerData[a.id]?.vp || 0); if (vd !== 0) return vd; return Object.values(allTickets[b.id] || {}).reduce((s, v) => s + v, 0) - Object.values(allTickets[a.id] || {}).reduce((s, v) => s + v, 0); })[0];
  }, [phase, players, playerData, allTickets]);

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════
  const CS = { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflowX: "hidden" };
  const card = { background: "rgba(15,14,26,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: 20, backdropFilter: "blur(10px)" };
  const bp = { padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", cursor: "pointer", fontSize: 15, transition: "all 0.2s" };
  const bs = { ...bp, background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed" };
  const bd = { ...bp, background: "linear-gradient(135deg, #dc2626, #b91c1c)" };
  const [showUpdateNotes, setShowUpdateNotes] = useState(false);
  const [showPopupObjectives, setShowPopupObjectives] = useState(false);
  const logBtn = <button onClick={() => setShowLog(!showLog)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📜</button>;
  const discardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowDiscard(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #6b7280", background: "rgba(107,114,128,0.2)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🗑️</button> : null;
  const updateNotesBtn = <button onClick={() => setShowUpdateNotes(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #22c55e", background: "rgba(34,197,94,0.2)", color: "#4ade80", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📋</button>;
  const utilButtons = <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", padding: "4px 12px" }}>{updateNotesBtn}{discardBtn}{logBtn}</div>;
  const popupObjectivesPanel = showPopupObjectives ? <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid #7c3aed40", textAlign: "left" }}>
    {playerObjectives[currentPlayerId] && <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase" }}>🎯 Artist Objective: {playerObjectives[currentPlayerId].name}</div>
      <div style={{ fontSize: 10, color: "#94a3b8" }}>{playerObjectives[currentPlayerId].req}</div>
      <div style={{ fontSize: 9, color: "#4ade80" }}>{playerObjectives[currentPlayerId].reward1}</div>
    </div>}
    {(playerCouncils[currentPlayerId] || []).map((co, ci) => <div key={ci} style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>📋 {co.obj.name}</div>
      <div style={{ fontSize: 9, color: "#94a3b8" }}>{co.obj.req} → {co.obj.benefit}</div>
    </div>)}
    {activeGoals.map((ag, gi) => <div key={gi} style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24" }}>🏆 {ag.goal.name}</div>
      <div style={{ fontSize: 9, color: "#94a3b8" }}>{ag.goal.req2} | {ag.goal.req3}</div>
    </div>)}
  </div> : null;
  const objectivesToggle = <button onClick={() => setShowPopupObjectives(p => !p)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 6, border: "1px solid #7c3aed40", background: showPopupObjectives ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", color: "#c4b5fd", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>{showPopupObjectives ? "Hide Objectives ▲" : "Show Objectives ▼"}</button>;
  const anim = <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes headlinerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @keyframes affordPulse { 0%,100% { box-shadow: 0 0 4px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } } .obj-hover-parent:hover .obj-hover-tip { display: block !important; max-height: 300px !important; padding: 10px !important; margin-top: 8px !important; opacity: 1 !important; } @keyframes floatUp { 0% { opacity:1; transform:translateY(0) scale(1); } 50% { opacity:1; transform:translateY(-30px) scale(1.2); } 100% { opacity:0; transform:translateY(-60px) scale(0.8); } } @keyframes bookReveal { 0% { opacity:0; transform:scale(0.5) rotate(-5deg); } 50% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } } @keyframes pulse { 0%,100% { transform:scale(1); box-shadow: 0 0 8px rgba(251,191,36,0.3); } 50% { transform:scale(1.05); box-shadow: 0 0 20px rgba(251,191,36,0.6); } }`}</style>;

  const updateNotesModal = showUpdateNotes ? <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowUpdateNotes(false)}>
    <div style={{ background: "#0f0e1a", border: "1px solid #22c55e", borderRadius: 16, padding: 24, maxWidth: 600, maxHeight: "80vh", overflowY: "auto", width: "100%" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#4ade80", fontSize: 20, margin: 0 }}>📋 Update Notes</h2>
        <button onClick={() => setShowUpdateNotes(false)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ color: "#e9d5ff", fontSize: 12, lineHeight: 1.8 }}>
        <h3 style={{ color: "#fbbf24", marginTop: 0, fontSize: 16 }}>Patch Notes — March 2026</h3>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🆕 New Systems</h4>
        <p>• <strong style={{ color: "#4ade80" }}>Funk Genre</strong> — 15 new Funk artists join the roster. Catering-heavy costs, community-focused effects. 90 artists total across 6 genres.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Goals</strong> — 2 random goals drawn each game. All players race to complete 3 tiers of requirements. Tier 1 rewards everyone, Tiers 2-3 reward the first player to get there with a free artist or VP.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Free Artist Draws</strong> — Between years, draw 1 free artist per stage you own (from pool or deck). Replaces free amenities.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Council Choice</strong> — Spending a catering van now draws 2 council objectives. Pick 1, the other goes back.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Fame Rework</h4>
        <p>• <strong style={{ color: "#4ade80" }}>Ticket Fame</strong> — +1 Fame for every 20 tickets earned in a year.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Lineup Fame</strong> — +1 Fame when you complete a 3-artist lineup on a stage.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Stage Fame</strong> — +1 Fame when you open a new stage.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Stages at Fame 3</strong> — Open new stages at Fame 3 instead of 5. All players go through the between-years phase.</p>
        <p>• Fame cap remains at 5. Trending council fame capped at +1 max.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Artist Objectives Rework</h4>
        <p>• Objectives are now genre-based (1 per genre). Feature full lineups of your genre to earn rewards at the start of each year.</p>
        <p>• 1st lineup: genre-specific reward (Pop draws from pool, Rock rolls dice, Electronic places amenity, Hip Hop discards event, Indie helps everyone, Funk draws from deck).</p>
        <p>• 2nd lineup: same reward + 1 Fame.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>📋 Council Objectives</h4>
        <p>• All council objectives now reward tickets instead of VP.</p>
        <p>• <strong>Glamping</strong> now requires campsite + security + portaloo cluster.</p>
        <p>• <strong>Luxury Loos</strong> now requires portaloo-security-portaloo sandwich.</p>
        <p>• <strong>Thieves in the Night / Meat the Law</strong> now use "within 2 tiles" coverage instead of surrounding.</p>
        <p>• <strong>Ticket Evaders, Toxic Waste, Noise Complaints</strong> grant bonus VP when you move amenities strategically.</p>
        <p>• 3 new objectives: Chef Beef, Show of Power, Keep the Peace.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>⚔️ Events & Security</h4>
        <p>• Each security sacrificed now blocks <strong>2</strong> negative events instead of 1.</p>
        <p>• All events are now blockable (TED Talk and Passed Out were previously unavoidable).</p>
        <p>• Rowdy Crowd nerfed from -2 to -1 ticket per act.</p>
        <p>• Agent Fallout nerfed to lose 1 card (was 1/3 of hand).</p>
        <p>• Dehydration is now flat -1 Fame (was -2 at high fame).</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🎤 Artist & Action Changes</h4>
        <p>• Portaloo refresh now refreshes the artist pool <strong>twice</strong>.</p>
        <p>• Book from Discard removed.</p>
        <p>• Players must take an action before ending their turn.</p>
        <p>• "All players draw" effects no longer give duplicates.</p>
        <p>• Vampire Weekend's "Roll all dice" effect now works correctly.</p>
        <p>• Heart/Slipknot/Rage Against the Machine now give 2 tickets per Fame die (was 1).</p>

        <h4 style={{ color: "#94a3b8", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Minor Changes</h4>
        <p style={{ color: "#94a3b8" }}>• Fame max raised to 5 (was 4). • Form a Line gives count-1 tickets (2 vans = 1 ticket). • Chef Beef requires minimum 2 catering. • Microtrends now include Funk. • Goals tab shows progress bars for all players. • Council objectives evaluated before events phase.</p>
      </div>
    </div>
  </div> : null;

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ═══════════════════════════════════════════════════════════
  if (phase === "lobby") return (
    <div style={CS}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #c4b5fd, #fbbf24, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -2 }}>🎪 HEADLINERS</h1>
        <p style={{ color: "#8b5cf6", fontSize: 16, marginTop: 8, letterSpacing: 4, textTransform: "uppercase" }}>Build the biggest festival</p>
      </div>
      <div style={{ ...card, maxWidth: 520, width: "100%" }}>
        <div style={{ marginBottom: 24 }}><label style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>Number of Players</label>
          <div style={{ display: "flex", gap: 8 }}>{[2, 3, 4, 5].map(n => <button key={n} onClick={() => handlePlayerCountChange(n)} style={{ ...bs, background: playerCount === n ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)", flex: 1 }}>{n}</button>)}</div>
        </div>
        {players.map((p, i) => <div key={i} style={{ marginBottom: 16 }}><label style={{ color: "#a78bfa", fontWeight: 600, fontSize: 12, display: "block", marginBottom: 4 }}>Player {i + 1} {p.isAI ? <span style={{ color: "#fbbf24", fontSize: 10 }}>🤖 AI</span> : ""} — Festival Name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={p.festivalName} onChange={e => setPlayers(pr => pr.map((pp, ii) => ii === i ? { ...pp, festivalName: e.target.value } : pp))} placeholder={p.isAI ? "AI festival name..." : "Enter festival name..."} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: p.isAI ? "1px solid #fbbf24" : "1px solid #4c1d95", background: p.isAI ? "#1a1a10" : "#1a1a2e", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
            <button onClick={() => randomizeName(i)} style={{ ...bs, padding: "10px 12px", fontSize: 16 }} title="Randomize">🎲</button>
            <button onClick={() => {
              setPlayers(pr => pr.map((pp, ii) => {
                if (ii !== i) return pp;
                const nowAI = !pp.isAI;
                return { ...pp, isAI: nowAI, festivalName: nowAI && !pp.festivalName ? AI_NAMES[i % AI_NAMES.length] : pp.festivalName };
              }));
            }} style={{ ...bs, padding: "10px 12px", fontSize: 14, background: p.isAI ? "rgba(251,191,36,0.3)" : "rgba(124,58,237,0.15)", border: p.isAI ? "1px solid #fbbf24" : "1px solid #7c3aed", color: p.isAI ? "#fbbf24" : "#c4b5fd" }} title="Toggle AI">🤖</button>
          </div></div>)}
        <button onClick={startSetup} disabled={!canStartSetup} style={{ ...bp, width: "100%", marginTop: 16, padding: "14px 24px", fontSize: 16, opacity: canStartSetup ? 1 : 0.4 }}>Start Setup →</button>
      </div>
    </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: SETUP
  // ═══════════════════════════════════════════════════════════
  if (phase === "setup") {
    const pd = playerData[currentSetupPlayer.id] || {};
    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, minHeight: "100vh" }}>
        <h2 style={{ color: "#c4b5fd", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🎪 Setup — {currentSetupPlayer.festivalName}</h2>
        <p style={{ color: "#8b5cf6", fontSize: 13, marginBottom: 20 }}>Player {setupIndex + 1} of {players.length}</p>
        {setupStep === "viewCouncil" && (() => {
          const councils = playerCouncils[currentSetupPlayer.id] || [];
          const co = councils[0];
          return co ? <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#22c55e", marginBottom: 8, fontSize: 20 }}>📋 Your Council Objective</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>This is a spatial objective — keep it satisfied on your board for passive bonuses!</p>
            <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(124,58,237,0.15))", border: "2px solid #22c55e", marginBottom: 16 }}>
              <h4 style={{ color: "#22c55e", fontSize: 18, margin: "0 0 6px" }}>{co.obj.name}</h4>
              <p style={{ color: "#e9d5ff", fontSize: 13, margin: "0 0 8px", fontStyle: "italic" }}>"{co.obj.flavour}"</p>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: "0 0 8px" }}>Requirement: {co.obj.req}</p>
              <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(34,197,94,0.2)", display: "inline-block" }}>
                <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>Passive: {co.obj.benefit}</span>
              </div>
              </div>
            <button onClick={confirmViewCouncil} style={{ ...bp, width: "100%" }}>Got it! Continue →</button>
          </div> : null;
        })()}
        {setupStep === "viewObjective" && (() => {
          const obj = playerObjectives[currentSetupPlayer.id];
          return obj ? <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#fbbf24", marginBottom: 8, fontSize: 20 }}>🎯 Your Secret Objective</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>This is your personal objective for the entire game. Only you can see it!</p>
            <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(124,58,237,0.15))", border: "2px solid #fbbf24", marginBottom: 16 }}>
              <h4 style={{ color: "#fbbf24", fontSize: 18, margin: "0 0 6px" }}>{obj.name}</h4>
              <p style={{ color: "#e9d5ff", fontSize: 14, margin: "0 0 8px" }}>{obj.desc}</p>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: "0 0 12px", fontStyle: "italic" }}>Requirement: {obj.req}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 11 }}>1st lineup: {obj.reward1}</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: 11 }}>2nd lineup: {obj.reward2}</span>
              </div>
            </div>
            <button onClick={confirmViewObjective} style={{ ...bp, width: "100%" }}>Got it! Continue to Draft →</button>
          </div> : null;
        })()}
        {setupStep === "draftArtist" && <div style={{ ...card, maxWidth: 700, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 8 }}>Draft your starting artists</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Choose <strong style={{ color: "#fbbf24" }}>2</strong> of these 6 artists for your hand. The rest go back into the deck.</p>
          {/* Objective reminders */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            {playerObjectives[currentSetupPlayer.id] && <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", textAlign: "left", maxWidth: 220 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>🎯 Artist Objective</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", fontWeight: 600 }}>{playerObjectives[currentSetupPlayer.id].name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>{playerObjectives[currentSetupPlayer.id].req}</div>
            </div>}
            {(playerCouncils[currentSetupPlayer.id] || []).map((co, ci) => <div key={ci} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "left", maxWidth: 220 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>📋 Council</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", fontWeight: 600 }}>{co.obj.name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>{co.obj.benefit}</div>
            </div>)}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {setupDraftOptions.map((a, i) => <ArtistCard key={i} artist={a} showCost selected={(setupDraftSelected || []).includes(i)} onClick={() => toggleDraftSelection(i)} />)}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>{(setupDraftSelected || []).length}/2 selected</p>
          <button onClick={confirmSetupDraft} disabled={(setupDraftSelected || []).length !== 2} style={{ ...bp, width: "100%", opacity: (setupDraftSelected || []).length === 2 ? 1 : 0.4 }}>Draft 2 Artists →</button>
        </div>}
        {setupStep === "pickAmenity" && <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 12 }}>Choose your starting amenity</h3>
          {/* Council reminder — relevant for amenity choice */}
          {(playerCouncils[currentSetupPlayer.id] || []).map((co, ci) => <div key={ci} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 12, textAlign: "left" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>📋 Council Objective — consider this when placing!</div>
            <div style={{ fontSize: 11, color: "#e9d5ff", fontWeight: 600 }}>{co.obj.name}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Requires: {co.obj.req}</div>
            <div style={{ fontSize: 10, color: "#4ade80" }}>Passive: {co.obj.benefit}</div>
          </div>)}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{AMENITY_TYPES.map(t => <button key={t} onClick={() => setSetupSelectedAmenity(t)} style={{ padding: 16, borderRadius: 12, border: setupSelectedAmenity === t ? `2px solid ${AMENITY_COLORS[t]}` : "2px solid #2a2a4a", background: setupSelectedAmenity === t ? "rgba(124,58,237,0.2)" : "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 28 }}>{AMENITY_ICONS[t]}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{AMENITY_LABELS[t]}</div></button>)}</div>
          <button onClick={confirmSetupAmenity} disabled={!setupSelectedAmenity} style={{ ...bp, marginTop: 20, width: "100%", opacity: setupSelectedAmenity ? 1 : 0.4 }}>Confirm →</button>
        </div>}
        {setupStep === "placeStage" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>🎤 Click to place your stage</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleSetupHexClick} placingStage hoverHex={hoverHex} onHexHover={setHoverHex} /></div></div>}
        {setupStep === "placeAmenity" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>{AMENITY_ICONS[pd.setupAmenity]} Place your {AMENITY_LABELS[pd.setupAmenity]} (not on stage)</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={playerData[currentSetupPlayer.id]?.stages || []} amenities={playerData[currentSetupPlayer.id]?.amenities || []} onHexClick={handleSetupHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} /></div><button onClick={undoSetupPlacement} style={{ ...bs, marginTop: 12 }}>↩ Undo</button></div>}
        {setupStep === "confirm" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#34d399", margin: 0, fontSize: 14, fontWeight: 600 }}>✓ Confirm your placement.</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={playerData[currentSetupPlayer.id]?.stages || []} amenities={playerData[currentSetupPlayer.id]?.amenities || []} onHexHover={setHoverHex} hoverHex={hoverHex} /></div><div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}><button onClick={undoSetupPlacement} style={bs}>↩ Undo</button><button onClick={confirmSetupPlacement} style={bp}>{setupIndex < players.length - 1 ? "Confirm & Next →" : "Confirm & Start 🎶"}</button></div></div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME
  // ═══════════════════════════════════════════════════════════
  if (phase === "game") {
    const handCards = currentPD.hand || [];
    const stageArtists = currentPD.stageArtists || currentPD.stages?.map(() => []) || [];
    return (<div style={CS}>{utilButtons}{updateNotesModal}
      {showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {showDiscard && <DiscardViewer discard={discardPile} onClose={() => setShowDiscard(false)} />}
      {/* Headliner celebration */}
      {/* Dice Roll Overlay */}
      {pendingDiceRoll && <DiceRollOverlay
        pendingRoll={pendingDiceRoll}
        sfx={sfx}
        onRoll={(results) => setPendingDiceRoll(prev => ({ ...prev, results, rolled: true }))}
        onComplete={(results) => { if (pendingDiceRoll.callback) pendingDiceRoll.callback(results); setPendingDiceRoll(null); }}
      />}
      {showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowHeadliner(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.5s" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌟🎤🌟</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", margin: "0 0 12px", animation: "headlinerPulse 1s infinite" }}>HEADLINER!</h1>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showHeadliner.artist} showCost /></div>
          <p style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 4 }}>Headlines at {showHeadliner.festival}!</p>
          {showHeadliner.artist.effect && <p style={{ color: "#fbbf24", fontSize: 14, padding: "8px 16px", borderRadius: 10, background: "rgba(251,191,36,0.1)", display: "inline-block" }}>✨ {showHeadliner.artist.effect}</p>}
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Booked artist popup (non-headliner) */}
      {showBookedArtist && !showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 945, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowBookedArtist(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.4s" }}>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 8 }}>🎤 Booked to {showBookedArtist.stageName}</p>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showBookedArtist.artist} showCost /></div>
          {showBookedArtist.artist.effect && <div style={{ marginTop: 4 }}>
            <p style={{ color: "#4ade80", fontSize: 13, padding: "6px 14px", borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "inline-block" }}>✨ {showBookedArtist.artist.effect}</p>
          </div>}
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Floating bonuses */}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      {/* Stage detail popup */}
      {showStageDetail && (() => {
        const sd = showStageDetail;
        const pd = playerData[sd.playerId] || {};
        const sa = (pd.stageArtists || [])[sd.stageIdx] || [];
        const sName = (pd.stageNames || [])[sd.stageIdx] || `Stage ${sd.stageIdx + 1}`;
        const sColor = (pd.stageColors || [])[sd.stageIdx] || "#7c3aed";
        const totalTickets = sa.reduce((s, a) => s + a.tickets, 0);
        const totalVP = sa.reduce((s, a) => s + a.vp, 0);
        const allGenres = new Set(); sa.forEach(a => getGenres(a.genre).forEach(g => allGenres.add(g)));
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowStageDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: `2px solid ${sColor}`, borderRadius: 20, padding: 28, maxWidth: 500, width: "100%", textAlign: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: sColor, margin: "0 auto 8px" }} />
            <h2 style={{ color: sColor, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{sName}</h2>
            <p style={{ color: "#8b5cf6", fontSize: 12, margin: "0 0 8px" }}>{sa.length === 3 ? "🎉 Full Lineup!" : `${sa.length}/3 artists booked`}</p>
            {allGenres.size > 0 && <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
              {[...allGenres].map(g => <span key={g} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700 }}>{g}</span>)}
            </div>}
            {sa.length === 0 && <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>No artists booked yet. Book artists to fill your lineup!</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {sa.map((a, ai) => {
                const isHL = ai === 2;
                const gs = getGenres(a.genre);
                return <div key={ai} style={{ padding: 14, borderRadius: 14, background: genreGradient(a.genre), color: "#fff", textAlign: "left", position: "relative", border: isHL ? "3px solid #fbbf24" : "2px solid rgba(255,255,255,0.1)", boxShadow: isHL ? "0 0 20px rgba(251,191,36,0.3)" : "0 2px 8px rgba(0,0,0,0.3)" }}>
                  {isHL && <div style={{ position: "absolute", top: -10, right: 12, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 10, textTransform: "uppercase", boxShadow: "0 2px 8px rgba(251,191,36,0.4)" }}>⭐ Headliner</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{gs.map(g => <span key={g} style={{ marginRight: 6 }}>{g}</span>)} • 🔥 {a.fame}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>🎟️ {a.tickets}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>⭐ {a.vp} VP</div>
                    </div>
                  </div>
                  {a.effect && <div style={{ fontSize: 11, marginTop: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>✨ {a.effect}</div>}
                </div>;
              })}
            </div>
            {sa.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 0", borderTop: "1px solid #2a2a4a", borderBottom: "1px solid #2a2a4a", marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Tickets</div><div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>{totalTickets}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>VP</div><div style={{ fontSize: 22, fontWeight: 900, color: "#c4b5fd" }}>{totalVP}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Genres</div><div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>{allGenres.size}</div></div>
            </div>}
            <button onClick={() => setShowStageDetail(null)} style={{ ...bp }}>Close</button>
          </div>
        </div>;
      })()}
      {/* Pending Effect Resolution */}
      {pendingEffect && pendingEffectPid === currentPlayerId && (() => {
        const pe = pendingEffect;
        const pid = pendingEffectPid;
        const pd = playerData[pid] || {};

        const handleEffectPlacement = (col, row) => {
          if (isOnStage(col, row, pd.stages) || pd.amenities.some(a => a.col === col && a.row === row)) return;
          const aType = pe.amenityType || pe.chosenType;
          if (!aType) return;
          setPlayerData(p => {
            const updated = { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: aType }] };
            // Check Kendrick-style VP bonus inline
            if (aType === "security" && p[pid].vpPerSecurity > 0) {
              updated.vp = (updated.vp || 0) + p[pid].vpPerSecurity;
              addLog("Effect", `+${p[pid].vpPerSecurity} VP from security placement!`);
            }
            return { ...p, [pid]: updated };
          });
          addLog("Effect", `Placed bonus ${AMENITY_LABELS[aType]} at (${col},${row})`);
          sfx.placeAmenity();
          const remaining = (pe.placeCount || 1) - 1;
          if (remaining > 0) {
            if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
            else setPendingEffect({ ...pe, placeCount: remaining });
          } else {
            setPendingEffect(null); setPendingEffectPid(null);
          }
          setTimeout(() => recalcTickets(), 50);
        };

        if (pe.type === "placeSpecific") {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", marginBottom: 12, padding: "12px 20px" }}>
              <p style={{ color: "#4ade80", margin: 0, fontSize: 14, fontWeight: 600 }}>✨ {pe.artistName}: Place your bonus {AMENITY_ICONS[pe.amenityType]} {AMENITY_LABELS[pe.amenityType]}!{(pe.placeCount || 1) > 1 ? ` (${pe.placeCount} remaining)` : ""}</p>
            </div>
            <HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleEffectPlacement} onHexHover={setHoverHex} hoverHex={hoverHex} stageColors={pd.stageColors || []} />
          </div>;
        }

        if (pe.type === "placeAmenity" && !pe.chosenType) {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Choose an amenity to place!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {AMENITY_TYPES.map(t => <button key={t} onClick={() => setPendingEffect({ ...pe, chosenType: t })} style={{ padding: 14, borderRadius: 10, border: "2px solid #2a2a4a", background: "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{AMENITY_ICONS[t]}</div>
                  <div style={{ fontWeight: 600, marginTop: 4, fontSize: 12 }}>{AMENITY_LABELS[t]}</div>
                </button>)}
              </div>
            </div>
          </div>;
        }

        if (pe.type === "placeAmenity" && pe.chosenType) {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", marginBottom: 12, padding: "12px 20px" }}>
              <p style={{ color: "#4ade80", margin: 0, fontSize: 14, fontWeight: 600 }}>✨ Place your bonus {AMENITY_ICONS[pe.chosenType]} {AMENITY_LABELS[pe.chosenType]}!</p>
            </div>
            <HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleEffectPlacement} onHexHover={setHoverHex} hoverHex={hoverHex} stageColors={pd.stageColors || []} />
          </div>;
        }

        if (pe.type === "signArtist") {
          const remaining = pe.signCount || 1;
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Sign {remaining} artist{remaining > 1 ? "s" : ""}!</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick an artist from the pool to add to your hand{remaining > 1 ? ` (${remaining} remaining)` : ""}:</p>
              {pe.canRefresh && !poolRefreshedByEffect && <button onClick={() => {
                refreshPool(); setPoolRefreshedByEffect(true);
                addLog("Effect", "Refreshed artist pool");
              }} style={{ ...bs, fontSize: 11, marginBottom: 10 }}>🔄 Refresh Pool First</button>}
              {poolRefreshedByEffect && <p style={{ color: "#4ade80", fontSize: 10, marginBottom: 8 }}>✓ Pool refreshed</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small onClick={() => {
                  const newPool = [...artistPool]; newPool.splice(i, 1);
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                  addLog("Effect", `Signed ${a.name} from pool`);
                  refillPool(newPool);
                  if (remaining > 1) {
                    setPendingEffect({ ...pe, signCount: remaining - 1 });
                  } else {
                    setPendingEffect(null); setPendingEffectPid(null);
                    setDeferPoolRefresh(false);
                  }
                }} />)}
              </div>
              <button onClick={() => {
                const drawn = drawFromDeck(1);
                if (drawn.length > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, drawn[0]] } })); addLog("Effect", `Signed ${drawn[0].name} from deck`); }
                if (remaining > 1) {
                  setPendingEffect({ ...pe, signCount: remaining - 1 });
                } else {
                  setPendingEffect(null); setPendingEffectPid(null);
                  if (deferPoolRefresh) { refillPool(); setDeferPoolRefresh(false); }
                }
              }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>📦 Draw from Deck instead</button>
            </div>
          </div>;
        }

        if (pe.type === "pickFromDrawn") {
          const keepCount = pe.keepCount || 1;
          const selected = pe.selected || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Pick {keepCount} to keep!</h3>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10 }}>{selected.length}/{keepCount} selected</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {pe.drawn.map((a, i) => <ArtistCard key={i} artist={a} showCost
                  selected={selected.includes(i)}
                  onClick={() => {
                    if (keepCount === 1) {
                      // Single pick — instant
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                      const other = pe.drawn.filter((_, j) => j !== i);
                      setDiscardPile(prev => [...prev, ...other]);
                      addLog("Effect", `Kept ${a.name}, discarded ${other.map(o => o.name).join(", ")}`);
                      setPendingEffect(null); setPendingEffectPid(null);
                    } else {
                      // Multi pick — toggle selection
                      const newSel = selected.includes(i) ? selected.filter(s => s !== i) : [...selected, i];
                      if (newSel.length <= keepCount) setPendingEffect({ ...pe, selected: newSel });
                    }
                  }} />)}
              </div>
              {keepCount > 1 && selected.length === keepCount && <button onClick={() => {
                const kept = selected.map(i => pe.drawn[i]);
                const other = pe.drawn.filter((_, i) => !selected.includes(i));
                setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, ...kept] } }));
                setDiscardPile(prev => [...prev, ...other]);
                addLog("Effect", `Kept ${kept.map(a => a.name).join(", ")}`);
                setPendingEffect(null); setPendingEffectPid(null);
              }} style={{ ...bp, marginTop: 12 }}>Confirm Selection ✓</button>}
            </div>
          </div>;
        }

        // Funk: Discard hand artists for tickets (Teena Marie)
        if (pe.type === "discardHandForTickets") {
          const handCards = pd.hand || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard {pe.discardCount} artist for +{pe.ticketReward} tickets</h3>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Click an artist from your hand to discard:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <ArtistCard key={i} artist={a} small onClick={() => {
                  setPlayerData(p => { const nh = [...p[pid].hand]; nh.splice(i, 1); return { ...p, [pid]: { ...p[pid], hand: nh, bonusTickets: (p[pid].bonusTickets || 0) + pe.ticketReward } }; });
                  setDiscardPile(prev => [...prev, a]);
                  addLog("Effect", `Discarded ${a.name} → +${pe.ticketReward} tickets`);
                  showFloatingBonus(`+${pe.ticketReward} 🎟️`, "#fbbf24");
                  setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                }} />)}
              </div>
              {handCards.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No cards in hand to discard.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
            </div>
          </div>;
        }

        // Funk: Discard 2 hand artists, gain ticket value of one (Rick James)
        if (pe.type === "discardHandForTicketValue") {
          const handCards = pd.hand || [];
          const selected = pe.selected || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard 2 artists, gain tickets of one</h3>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Select 2 artists to discard ({selected.length}/2). You'll gain the ticket value of one.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <div key={i} style={{ border: selected.includes(i) ? "2px solid #fbbf24" : "2px solid transparent", borderRadius: 10 }}>
                  <ArtistCard artist={a} small onClick={() => {
                    const ns = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
                    if (ns.length <= 2) setPendingEffect({ ...pe, selected: ns });
                  }} />
                </div>)}
              </div>
              {selected.length === 2 && <div style={{ marginTop: 12 }}>
                <p style={{ color: "#fbbf24", fontSize: 12, marginBottom: 8 }}>Which artist's tickets do you want to gain?</p>
                {selected.map(si => <button key={si} onClick={() => {
                  const ticketGain = handCards[si].tickets || 0;
                  const toDiscard = selected.map(x => handCards[x]);
                  setPlayerData(p => {
                    const nh = [...p[pid].hand];
                    // Remove from end first to avoid index shift
                    selected.sort((a, b) => b - a).forEach(x => nh.splice(x, 1));
                    return { ...p, [pid]: { ...p[pid], hand: nh, bonusTickets: (p[pid].bonusTickets || 0) + ticketGain } };
                  });
                  setDiscardPile(prev => [...prev, ...toDiscard]);
                  addLog("Effect", `Discarded ${toDiscard.map(a=>a.name).join(", ")} → +${ticketGain} tickets (${handCards[si].name})`);
                  showFloatingBonus(`+${ticketGain} 🎟️`, "#fbbf24");
                  setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                }} style={{ ...bs, margin: 4 }}>{handCards[si].name} ({handCards[si].tickets} 🎟️)</button>)}
              </div>}
              {handCards.length < 2 && <><p style={{ color: "#f87171", fontSize: 12 }}>Need 2 cards in hand.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
            </div>
          </div>;
        }

        // Funk: Discard one amenity for tickets (Betty Davis)
        if (pe.type === "discardAmenityForTickets") {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard 1 amenity for +{pe.ticketReward} tickets</h3>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Click an amenity on your board to remove it:</p>
              <HexGrid stages={pd.stages || []} amenities={pd.amenities || []} stageColors={pd.stageColors || []} onHexClick={(col, row) => {
                const am = pd.amenities.find(a => a.col === col && a.row === row);
                if (!am) return;
                setPlayerData(p => ({
                  ...p, [pid]: { ...p[pid],
                    amenities: p[pid].amenities.filter(a => !(a.col === col && a.row === row)),
                    bonusTickets: (p[pid].bonusTickets || 0) + pe.ticketReward
                  }
                }));
                addLog("Effect", `Discarded ${AMENITY_LABELS[am.type]} → +${pe.ticketReward} tickets`);
                showFloatingBonus(`+${pe.ticketReward} 🎟️`, "#fbbf24");
                setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
              }} onHexHover={setHoverHex} hoverHex={hoverHex} />
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button>
            </div>
          </div>;
        }

        // Funk: Discard 2 artists, draw and play 1 for free (Silk Sonic)
        if (pe.type === "discardHandDrawFree") {
          const handCards = pd.hand || [];
          const selected = pe.selected || [];
          if (!pe.drawnFree) {
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
                <h3 style={{ color: "#fbbf24", marginBottom: 8 }}>🌟 {pe.artistName}: Discard 2 artists, play 1 free!</h3>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Select 2 artists to discard ({selected.length}/2):</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {handCards.map((a, i) => <div key={i} style={{ border: selected.includes(i) ? "2px solid #fbbf24" : "2px solid transparent", borderRadius: 10 }}>
                    <ArtistCard artist={a} small onClick={() => {
                      const ns = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
                      if (ns.length <= 2) setPendingEffect({ ...pe, selected: ns });
                    }} />
                  </div>)}
                </div>
                {selected.length === 2 && <button onClick={() => {
                  const toDiscard = selected.map(x => handCards[x]);
                  setPlayerData(p => {
                    const nh = [...p[pid].hand];
                    selected.sort((a, b) => b - a).forEach(x => nh.splice(x, 1));
                    return { ...p, [pid]: { ...p[pid], hand: nh } };
                  });
                  setDiscardPile(prev => [...prev, ...toDiscard]);
                  const drawn = drawFromDeck(1);
                  if (drawn.length > 0) {
                    addLog("Effect", `Discarded ${toDiscard.map(a=>a.name).join(", ")} → drew ${drawn[0].name} (plays free!)`);
                    setPendingEffect({ ...pe, drawnFree: { ...drawn[0], freePlay: true } });
                  } else {
                    addLog("Effect", `No artists left in deck`);
                    setPendingEffect(null); setPendingEffectPid(null);
                  }
                }} style={{ ...bp, marginTop: 12 }}>Confirm Discard → Draw Free Artist</button>}
                {handCards.length < 2 && <><p style={{ color: "#f87171", fontSize: 12 }}>Need 2 cards in hand.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
              </div>
            </div>;
          } else {
            // Show drawn artist, player picks a stage
            const freeArtist = pe.drawnFree;
            const openStages = (pd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                <h3 style={{ color: "#fbbf24", marginBottom: 12 }}>🌟 Play for FREE!</h3>
                <ArtistCard artist={freeArtist} showCost />
                <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, marginBottom: 12 }}>Select a stage:</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {openStages.map(si => <button key={si} onClick={() => {
                    bookArtistToStage(freeArtist, si, pid);
                    addLog("Effect", `Played ${freeArtist.name} for FREE on stage ${si + 1}!`);
                    showFloatingBonus(`🌟 FREE!`, "#fbbf24");
                    setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                  }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                </div>
                {openStages.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No open stages! Artist goes to hand.</p><button onClick={() => {
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, freeArtist] } }));
                  setPendingEffect(null); setPendingEffectPid(null);
                }} style={{ ...bs, marginTop: 8 }}>Add to Hand</button></>}
              </div>
            </div>;
          }
        }

        return null;
      })()}
      {/* Council fame notification */}
      {showCouncilFame && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 940, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowCouncilFame(null)}>
        <div style={{ ...card, textAlign: "center", maxWidth: 400, animation: "fadeSlideIn 0.3s" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋🔥</div>
          <h2 style={{ color: "#22c55e", fontSize: 22, margin: "0 0 8px" }}>Council Objective Complete!</h2>
          <p style={{ color: "#e9d5ff", fontSize: 16 }}>"{showCouncilFame.name}"</p>
          <p style={{ color: "#fbbf24", fontSize: 14, marginTop: 8 }}>{showCouncilFame.festival} gains +1 Fame this round!</p>
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Year Announcement popup */}
      {showYearAnnouncement && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 920, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ ...card, textAlign: "center", maxWidth: 500, width: "100%", animation: "fadeSlideIn 0.4s" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎪📢</div>
          <h2 style={{ color: "#fbbf24", fontSize: 26, margin: "0 0 4px" }}>Year {year} — What's Trending</h2>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>Here's what the industry is buzzing about this year</p>
          {trendingCouncil && <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 10, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>📋📢 Trending Council Objective</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginTop: 4 }}>{trendingCouncil.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
            <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 4 }}>{trendingCouncil.tBenefit}</div>
          </div>}
          {microtrends.length > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎵 Microtrends — First to Book → +1 Fame</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {microtrends.map((mt, i) => <span key={i} style={{ padding: "5px 14px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 13, fontWeight: 700 }}>{mt.genre}</span>)}
            </div>
          </div>}
          <button onClick={() => { setShowYearAnnouncement(false); setShowTurnStart(true); }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Turn start popup */}
      {showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 440, animation: "fadeSlideIn 0.3s" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, margin: "0 0 8px" }}>🎪 {currentPlayer?.festivalName}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16 }}>Year {year} — <strong style={{ color: "#fbbf24" }}>{turnsLeft[currentPlayerId]}</strong> turns left</p>
          {playerObjectives[currentPlayerId] && (() => {
            const obj = playerObjectives[currentPlayerId];
            const { count } = countGenreLineups(obj, playerData[currentPlayerId] || {});
            return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective: {obj.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{obj.req}</div>
              <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4 }}>1st lineup: {obj.reward1}</div>
              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>2nd lineup: {obj.reward2}</div>
              {count > 0 && <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4, fontWeight: 700 }}>✅ {count} qualifying lineup{count > 1 ? "s" : ""} from last year!</div>}
            </div>;
          })()}
          {microtrends.some(mt => mt.claimedBy === null) && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎵 Microtrends (first to book → +1 Fame)</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {microtrends.filter(mt => mt.claimedBy === null).map((mt, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 11, fontWeight: 700 }}>{mt.genre}</span>)}
            </div>
          </div>}
          {trendingCouncil && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>📋📢 Trending Council: {trendingCouncil.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
            <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>{trendingCouncil.tBenefit}</div>
          </div>}
          <button onClick={() => {
            setShowTurnStart(false);
            setTurnNumber(prev => prev + 1);
            // Check if this player has an agent on a pool artist to resolve
            const resolution = resolvePoolAgents(currentPlayerId);
            if (resolution && resolution.type === "uncontested") {
              setPendingAgentArtist({ pid: resolution.pid, artist: resolution.artist });
            } else if (resolution && resolution.type === "contested") {
              setAgentContest(resolution);
            }
          }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Choice popup for OR dice */}
      {choiceAmenity && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 360 }}><h3 style={{ color: "#c4b5fd", marginBottom: 16 }}>Choose one:</h3>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {choiceAmenity === "catering_or_portaloo" ? <><button onClick={() => handleChoiceSelect("catering")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🍔<br /><span style={{ fontSize: 12 }}>Catering</span></button><button onClick={() => handleChoiceSelect("portaloo")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🚽<br /><span style={{ fontSize: 12 }}>Portaloo</span></button></> : <><button onClick={() => handleChoiceSelect("security")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>👮‍♀️<br /><span style={{ fontSize: 12 }}>Security</span></button><button onClick={() => handleChoiceSelect("campsite")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>⛺<br /><span style={{ fontSize: 12 }}>Campsite</span></button></>}
          </div></div>
      </div>}

      {/* Viewing another player's board */}
      {viewingPlayerId !== null && viewingPlayerId !== currentPlayerId && (() => {
        const vp = players.find(p => p.id === viewingPlayerId);
        const vpd = playerData[viewingPlayerId] || {};
        const vsa = vpd.stageArtists || vpd.stages?.map(() => []) || [];
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 890, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewingPlayerId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: "1px solid #fbbf24", borderRadius: 20, padding: 24, maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: "#fbbf24", fontSize: 20, margin: 0 }}>👁️ {vp?.festivalName}'s Festival</h2>
              <button onClick={() => setViewingPlayerId(null)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🎟️ {vpd.tickets || 0} tickets</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>⭐ {vpd.vp || 0} VP</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🔥 Fame {vpd.fame || 0}</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🃏 {(vpd.hand || []).length} in hand</span>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
              <HexGrid stages={vpd.stages || []} amenities={vpd.amenities || []} stageColors={vpd.stageColors || []} onCenterClick={(si) => setShowStageDetail({ stageIdx: si, playerId: viewingPlayerId })} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
                {(vpd.stages || []).map((_, si) => {
                  const sa = vsa[si] || [];
                  const sName = (vpd.stageNames || [])[si] || `Stage ${si + 1}`;
                  const sColor = (vpd.stageColors || [])[si] || "#7c3aed";
                  return <div key={si} style={{ padding: 8, borderRadius: 10, background: `${sColor}15`, border: `1px solid ${sColor}50` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: sColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, display: "inline-block" }} />{sName} {sa.length === 3 ? <span style={{ fontSize: 9, color: "#34d399" }}>✅</span> : <span style={{ fontSize: 9, color: "#94a3b8" }}>({sa.length}/3)</span>}
                    </div>
                    {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: genreGradient(a.genre), color: "#fff" }}>{ai === 2 ? "⭐ " : ""}{a.name} <span style={{ fontSize: 8, opacity: 0.7 }}>{a.vp}VP</span></div>)}
                    {sa.length === 0 && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>Empty</div>}
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>;
      })()}

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Player bar — horizontal scroll on mobile */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a4a", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch", minWidth: "max-content" }}>
            <div style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed40", whiteSpace: "nowrap" }}>
              <span style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13 }}>Year {year}/4</span>
              <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>📦{artistDeck.length}</span>
            </div>
            {players.map(p => { const pd = playerData[p.id] || {}; const ic = p.id === currentPlayerId; return (
              <div key={p.id} onClick={() => setViewingPlayerId(p.id === currentPlayerId ? null : (viewingPlayerId === p.id ? null : p.id))} style={{ padding: "6px 12px", borderRadius: 10, background: ic ? "rgba(124,58,237,0.25)" : "rgba(15,14,26,0.6)", border: ic ? "2px solid #7c3aed" : "1px solid #2a2a4a", cursor: "pointer", whiteSpace: "nowrap", minWidth: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: ic ? "#fbbf24" : "#c4b5fd" }}>{ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 8 }}>
                  <span>🎟️{pd.tickets||0}</span><span>⭐{pd.vp||0}</span><span>🔥{pd.fame||0}</span><span>🔄{turnsLeft[p.id]||0}</span>
                </div>
              </div>); })}
          </div>
        </div>
          {/* Accordion info panels */}
          {[
            { key: "my", label: "🎯 My Festival", color: "#c4b5fd", bg: "rgba(124,58,237,0.3)" },
            { key: "trending", label: "📢 Trending", color: "#fbbf24", bg: "rgba(251,191,36,0.3)" },
            { key: "goals", label: "🏆 Goals", color: "#fbbf24", bg: "rgba(251,191,36,0.3)" },
          ].map(tab => (
            <div key={tab.key} style={{ marginTop: 6 }}>
              <button onClick={() => setSidebarTab(sidebarTab === tab.key ? null : tab.key)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: sidebarTab === tab.key ? tab.bg : "rgba(124,58,237,0.08)", color: sidebarTab === tab.key ? tab.color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{tab.label}</span>
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: sidebarTab === tab.key ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {sidebarTab === tab.key && <div style={{ padding: "8px 12px", borderRadius: "0 0 10px 10px", background: "rgba(15,14,26,0.5)", borderLeft: `2px solid ${tab.color}30` }}>

          {tab.key === "my" && <>
            {/* Personal Objective */}
            {playerObjectives[currentPlayerId] && (() => { const obj = playerObjectives[currentPlayerId]; const { count } = countGenreLineups(obj, currentPD); return <div style={{ padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e9d5ff" }}>{obj.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{obj.req}</div>
              {count > 0 && <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>✅ {count} qualifying lineup{count > 1 ? "s" : ""}</div>}
              <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4 }}>1st: {obj.reward1}</div>
              <div style={{ fontSize: 11, color: "#fbbf24" }}>2nd: {obj.reward2}</div>
            </div>; })()}
            {/* Council Objectives */}
            {(playerCouncils[currentPlayerId] || []).length > 0 && <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>📋 Council Objectives</div>
              {(playerCouncils[currentPlayerId] || []).map((co, ci) => {
                const res = evalCouncilObjective(co.obj, currentPD, false);
                return <div key={ci} style={{ padding: 8, borderRadius: 8, marginBottom: 6, background: res.count > 0 ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.06)", border: `1px solid ${res.count > 0 ? "#22c55e50" : "#4c1d9540"}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: res.count > 0 ? "#4ade80" : "#94a3b8" }}>{co.obj.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{co.obj.req}</div>
                  <div style={{ fontSize: 12, color: res.count > 0 ? "#4ade80" : "#64748b", marginTop: 2 }}>
                    {res.tickets > 0 ? `+${res.tickets} 🎟️ tickets` : "No qualifying amenities yet"}
                  </div>
                </div>;
              })}
            </div>}
            {/* Fame breakdown */}
            <div style={{ padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.08)", fontSize: 13, color: "#fbbf24" }}>
              🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP at year end
            </div>
          </>}

          {tab.key === "trending" && <>
            {/* Trending Council */}
            {trendingCouncil && (() => {
              const tcRes = evalCouncilObjective(trendingCouncil, currentPD, true);
              return <div style={{ padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>📋 Trending Council</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e9d5ff" }}>{trendingCouncil.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
                {tcRes.fame > 0 && <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, marginTop: 4 }}>+{tcRes.fame} 🔥 Fame (all players)</div>}
              </div>;
            })()}
            {/* Microtrends */}
            {microtrends.length > 0 && <div style={{ padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🎵 Microtrends</div>
              {microtrends.map((mt, i) => {
                const claimed = mt.claimedBy !== null;
                const claimer = claimed ? players.find(p => p.id === mt.claimedBy)?.festivalName : null;
                return <div key={i} style={{ padding: "6px 10px", borderRadius: 8, marginBottom: 4, background: claimed ? "rgba(107,114,128,0.15)" : `${GENRE_COLORS[mt.genre]}15`, border: `1px solid ${claimed ? "#4b5563" : GENRE_COLORS[mt.genre]}40`, opacity: claimed ? 0.5 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: claimed ? "#6b7280" : GENRE_COLORS[mt.genre] }}>
                    {claimed ? "✓" : "🔥"} Book a {mt.genre} artist
                  </div>
                  {claimed && <div style={{ fontSize: 11, color: "#6b7280" }}>Claimed by {claimer}</div>}
                  {!claimed && <div style={{ fontSize: 11, color: "#94a3b8" }}>First to book → +1 Fame</div>}
                </div>;
              })}
            </div>}
          </>}

          {tab.key === "goals" && <>
            {activeGoals.map((ag, gi) => {
              const g = ag.goal;
              const myProgress = goalProgress[currentPlayerId]?.[g.trackKey] || 0;
              const done = myProgress >= g.target;
              return <div key={gi} style={{ padding: 10, borderRadius: 10, marginBottom: 8, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>🏆 {g.name} <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>({ag.rewardType === "artist" ? "Artist Prize" : "VP Race"})</span></div>
                <div style={{ fontSize: 12, color: done ? "#4ade80" : "#c4b5fd", marginBottom: 4 }}>{done ? "✅" : "🎯"} {g.desc} ({myProgress}/{g.target})</div>
                {ag.rewardType === "artist" && ag.setAsideArtists[0] && <div style={{ fontSize: 11, color: "#94a3b8" }}>Prize: <strong style={{ color: "#e9d5ff" }}>{ag.setAsideArtists[0].name}</strong> (★{ag.setAsideArtists[0].fame}) {ag.claimedBy1st !== null && <span style={{ color: "#4ade80" }}>→ {players.find(p => p.id === ag.claimedBy1st)?.festivalName}</span>}</div>}
                {ag.rewardType === "vp" && <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  1st: <strong style={{ color: "#fbbf24" }}>+10 VP</strong> {ag.claimedBy1st !== null && <span style={{ color: "#4ade80" }}>→ {players.find(p => p.id === ag.claimedBy1st)?.festivalName}</span>}
                  {" | "}2nd: <strong style={{ color: "#c4b5fd" }}>+5 VP</strong> {ag.claimedBy2nd !== null && <span style={{ color: "#4ade80" }}>→ {players.find(p => p.id === ag.claimedBy2nd)?.festivalName}</span>}
                </div>}
                <div style={{ marginTop: 6, padding: 6, borderRadius: 6, background: "rgba(124,58,237,0.06)" }}>
                  {players.map(p => {
                    const prog = goalProgress[p.id]?.[g.trackKey] || 0;
                    const pct = Math.min(100, (prog / g.target) * 100);
                    const isMe = p.id === currentPlayerId;
                    return <div key={p.id} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: isMe ? "#e9d5ff" : "#64748b" }}>
                        <span style={{ fontWeight: isMe ? 700 : 400 }}>{p.festivalName}</span>
                        <span>{prog}/{g.target}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "rgba(124,58,237,0.2)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: isMe ? "#fbbf24" : "#7c3aed", transition: "width 0.3s" }} />
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })}
            {activeGoals.length === 0 && <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>No goals active.</p>}
          </>}

              </div>}
            </div>
          ))}

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px", overflow: "auto" }}>
          <div style={{ marginBottom: 10, textAlign: "center" }}>
            <h2 style={{ color: "#fbbf24", fontSize: 22, margin: 0 }}>{currentPlayer?.festivalName}'s Turn</h2>
            <p style={{ color: "#8b5cf6", fontSize: 13, margin: "4px 0" }}>{turnsLeft[currentPlayerId]} turns remaining</p>
          </div>

          {/* Board + stage artists — stacked for mobile */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} onHexClick={handleGameHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} movingFrom={movingFrom} stageColors={currentPD.stageColors || []} onCenterClick={(si) => setShowStageDetail({ stageIdx: si, playerId: currentPlayerId })} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
              {(currentPD.stages || []).map((_, si) => {
                const sa = stageArtists[si] || [];
                const sName = (currentPD.stageNames || [])[si] || `Stage ${si + 1}`;
                const sColor = (currentPD.stageColors || [])[si] || "#7c3aed";
                return <div key={si} style={{ padding: 10, borderRadius: 12, background: `${sColor}15`, border: artistAction === "pickStage" && sa.length < 3 ? `2px solid ${sColor}` : `1px solid ${sColor}50`, cursor: artistAction === "pickStage" ? "pointer" : "default", transition: "all 0.2s" }} onClick={() => artistAction === "pickStage" && sa.length < 3 && handleStageSelect(si)}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: sColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, display: "inline-block" }} />
                    {sName} {sa.length === 3 ? <span style={{ fontSize: 9, color: "#34d399" }}>✅ FULL</span> : <span style={{ fontSize: 9, color: "#94a3b8" }}>({sa.length}/3)</span>}
                  </div>
                  {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, marginBottom: 2, background: genreGradient(a.genre), color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{ai === 2 ? "⭐ " : ""}{a.name}</span>
                    <span style={{ fontSize: 8, opacity: 0.8 }}>{a.vp}VP</span>
                  </div>)}
                  {sa.length === 0 && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>Empty</div>}
                  {sa.length < 3 && artistAction === "pickStage" && <div style={{ fontSize: 10, color: "#fbbf24", fontStyle: "italic", marginTop: 4 }}>↑ Click to book here</div>}
                </div>;
              })}
            </div>
          </div>

          {/* Available Artist Pool */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>Available Artists ({artistPool.length})</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {artistPool.map((a, i) => {
                const agentsOnThis = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                return <div key={i} style={{ position: "relative" }}>
                  <ArtistCard artist={a} showCost small
                    affordable={canAffordArtist(a, currentPD)}
                    disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                    onClick={() => {
                      if (artistAction === null && !actionTaken) {
                        // Show book/reserve choice
                      }
                    }}
                  />
                  {agentsOnThis.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                    {agentsOnThis.map(([pid, p], ai) => {
                      const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                      return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #1e1b4b" }}>🕵️</div>;
                    })}
                  </div>}
                </div>;
              })}
            </div>
          </div>

          {/* Player Hand */}
          {handCards.length > 0 && <div style={{ marginTop: 8 }}>
            <button onClick={() => setShowHand(!showHand)} style={{ ...bs, padding: "4px 12px", fontSize: 11, marginBottom: 6 }}>
              {showHand ? "Hide" : "Show"} Hand ({handCards.length} cards)
            </button>
            {showHand && <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small
                affordable={canAffordArtist(a, currentPD)}
                disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                onClick={() => artistAction === null && !actionTaken && handleBookFromHand(i)}
              />)}
            </div>}
          </div>}

          {/* Action bar */}
          <div style={{ ...card, width: "100%", maxWidth: 700, marginTop: 12, padding: 16, alignSelf: "center" }}>
            {actionTaken && !noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✓ Action complete! Review your board, then end your turn.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                {undoSnapshot && <button onClick={handleUndo} style={{ ...bs, color: "#fbbf24", border: "1px solid #fbbf24", background: "rgba(251,191,36,0.1)" }}>↩️ Undo</button>}
                {!movedThisTurn && !turnAction && <button onClick={handleMoveAmenity} style={{ ...bs, fontSize: 12 }}>↔️ Move Amenity (free)</button>}
                {hasAgent(currentPlayerId) && !turnAction && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, fontSize: 12, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🕵️ Deploy Agent (free)</button>}
                <button onClick={() => { setUndoSnapshot(null); endTurn(); }} style={bd}>End Turn →</button>
              </div>
            </div>}

            {!actionTaken && !turnAction && !noTurnsLeft && <div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePickAmenity} style={bp}>🎲 Pick Amenity</button>
                {!movedThisTurn && <button onClick={handleMoveAmenity} style={bs}>↔️ Move Amenity (free)</button>}
                {hasAgent(currentPlayerId) && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🕵️ Deploy Agent (free)</button>}
                <button onClick={handleArtistAction} style={{ ...bs, background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,115,22,0.3))", border: "1px solid #ec4899" }}>🎤 Book / Reserve Artist</button>
                {(currentPD.amenities || []).some(a => a.type === "catering") && councilDeck.length > 0 && <button onClick={() => { takeUndoSnapshot(); setTurnAction("buyCouncil"); }} style={{ ...bs, background: "rgba(249,115,22,0.15)", border: "1px solid #f97316", color: "#f97316" }}>🍔 Buy Council Objective</button>}
              </div>
            </div>}

            {/* Pick Amenity */}
            {!actionTaken && turnAction === "pickAmenity" && !placingAmenity && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>Pick a die to claim an amenity:</p>
              <DiceDisplay dice={dice} onPick={handleDiePick} canReroll={diceNeedReroll(dice)} onReroll={handleRerollDice} />
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}
            {!actionTaken && turnAction === "pickAmenity" && placingAmenity && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600 }}>{AMENITY_ICONS[placingAmenity]} Place your {AMENITY_LABELS[placingAmenity]} on an empty hex</p>
            </div>}

            {/* Move Amenity */}
            {!actionTaken && turnAction === "moveAmenity" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600 }}>{movingFrom ? `Moving ${AMENITY_ICONS[movingFrom.type]} — click destination` : "Click an amenity to pick it up"}</p>
              <button onClick={() => { setTurnAction(null); setMovingFrom(null); }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button>
            </div>}

            {/* Deploy Agent — pool claim only */}
            {(turnAction === "deployAgent" || turnAction === "agentPool") && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🕵️ Claim a Pool Artist</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Place your agent on an artist you can afford. Next turn: uncontested → book to stage. Contested → dice roll tiebreak (earliest placer wins ties).</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const canAfford = canAffordArtist(a, currentPD);
                  const agentsOnIt = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                  return <div key={i} style={{ position: "relative" }}>
                    <ArtistCard artist={a} showCost small onClick={() => {
                      if (!canAfford) return;
                      placeAgentOnArtist(currentPlayerId, i);
                      setTurnAction(null);
                    }} />
                    {!canAfford && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#f87171" }}>Can't afford</div>}
                    {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                      {agentsOnIt.map(([pid], ai) => {
                        const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                        return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #1e1b4b" }} title={players.find(pl => pl.id === parseInt(pid))?.festivalName}>🕵️</div>;
                      })}
                    </div>}
                  </div>;
                })}
              </div>
              <button onClick={() => setTurnAction(null)} style={{ ...bs, fontSize: 12, marginTop: 12 }}>← Cancel</button>
            </div>}

            {/* Pending agent artist booking (uncontested) */}
            {pendingAgentArtist && (() => {
              const pa = pendingAgentArtist;
              const pd = playerData[pa.pid];
              const openStages = (pd?.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                  <h3 style={{ color: "#60a5fa", marginBottom: 12 }}>🕵️ Agent Secured {pa.artist.name}!</h3>
                  <ArtistCard artist={pa.artist} showCost />
                  <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, marginBottom: 12 }}>Uncontested! Select a stage:</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {openStages.map(si => <button key={si} onClick={() => {
                      // Remove from pool
                      const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                      if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                      bookArtistToStage(pa.artist, si, pa.pid);
                      exhaustAgent(pa.pid);
                      addLog("🕵️ Agent", `Booked ${pa.artist.name} (uncontested agent claim)`);
                      setPendingAgentArtist(null);
                      setTimeout(() => recalcTickets(), 50);
                    }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                  </div>
                  {openStages.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No open stages! Artist goes to hand.</p><button onClick={() => {
                    setPlayerData(p => ({ ...p, [pa.pid]: { ...p[pa.pid], hand: [...p[pa.pid].hand, pa.artist] } }));
                    const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                    if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                    exhaustAgent(pa.pid);
                    setPendingAgentArtist(null);
                  }} style={{ ...bs, marginTop: 8 }}>Add to Hand</button></>}
                </div>
              </div>;
            })()}

            {/* Agent indicators on pool artists */}

            {/* Buy Council Objective */}
            {!actionTaken && turnAction === "buyCouncil" && !councilChoiceOptions && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f97316", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🍔 Select a catering van on your board to sacrifice</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>You'll draw 2 council objectives and pick 1.</p>
              <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} stageColors={currentPD.stageColors || []} onHexClick={(col, row) => {
                const am = currentPD.amenities.find(a => a.col === col && a.row === row && a.type === "catering");
                if (!am) return;
                setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: p[currentPlayerId].amenities.filter(a => !(a.col === col && a.row === row && a.type === "catering")) } }));
                const cd = [...councilDeck];
                if (cd.length >= 2) {
                  const opt1 = cd.pop(); const opt2 = cd.pop();
                  setCouncilDeck(cd);
                  setCouncilChoiceOptions([opt1, opt2]);
                  addLog(currentPlayer.festivalName, `Sacrificed 🍔 catering — choosing between ${opt1.name} and ${opt2.name}`);
                  sfx.placeAmenity();
                } else if (cd.length === 1) {
                  const newObj = cd.pop(); setCouncilDeck(cd);
                  const updatedCouncils = { ...playerCouncilsRef.current, [currentPlayerId]: [...(playerCouncilsRef.current[currentPlayerId] || []), { obj: newObj, active: true }] };
                  setPlayerCouncils(updatedCouncils);
                  playerCouncilsRef.current = updatedCouncils;
                  addLog(currentPlayer.festivalName, `Sacrificed 🍔 catering → ${newObj.name} (last in deck)`);
                  trackGoalProgress(currentPlayerId, "councilsBought");
                  showFloatingBonus(`📋 ${newObj.name}`, "#22c55e"); sfx.placeAmenity();
                  setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
                  setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
                }
              }} onHexHover={setHoverHex} hoverHex={hoverHex} />
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}
            {!actionTaken && turnAction === "buyCouncil" && councilChoiceOptions && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f97316", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 Pick one council objective:</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {councilChoiceOptions.map((obj, ci) => <div key={ci} onClick={() => {
                  const picked = obj;
                  const discarded = councilChoiceOptions[1 - ci];
                  const updatedCouncils = { ...playerCouncilsRef.current, [currentPlayerId]: [...(playerCouncilsRef.current[currentPlayerId] || []), { obj: picked, active: true }] };
                  setPlayerCouncils(updatedCouncils);
                  playerCouncilsRef.current = updatedCouncils;
                  setCouncilDeck(prev => [...prev, discarded]);
                  addLog(currentPlayer.festivalName, `Chose council objective: ${picked.name} (discarded ${discarded.name})`);
                  trackGoalProgress(currentPlayerId, "councilsBought");
                  showFloatingBonus(`📋 ${picked.name}`, "#22c55e");
                  setCouncilChoiceOptions(null);
                  setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
                  setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
                }} style={{ padding: 14, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "2px solid #22c55e40", cursor: "pointer", maxWidth: 220, textAlign: "left", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#22c55e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#22c55e40"}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>{obj.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{obj.req}</div>
                  <div style={{ fontSize: 10, color: "#4ade80" }}>{obj.benefit}</div>
                </div>)}
              </div>
            </div>}

            {/* Artist Action */}
            {/* Unified Artist Action Panel */}
            {!actionTaken && turnAction === "artist" && (artistAction === null || artistAction === "bookHand" || artistAction === "draw2") && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🎤 Artist Action</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Book from hand, or draw 2 from pool/deck</p>
              
              {/* Hand */}
              {handCards.length > 0 && <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#ec4899", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Your Hand — click to book</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtistOrFree(a, currentPD)} disabled={!canAffordArtistOrFree(a, currentPD)} onClick={() => handleBookFromHand(i)} />)}
                </div>
              </div>}
              
              {/* Draw 2 progress */}
              {draw2Picks.length > 0 && <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40" }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Drawing: {draw2Picks.length}/2 picked</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  {draw2Picks.map((a, i) => <ArtistCard key={i} artist={a} showCost small />)}
                </div>
              </div>}

              {/* Deck card reveal */}
              {draw2DeckCard && <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed" }}>
                <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Drawn from deck:</p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><ArtistCard artist={draw2DeckCard} showCost small /></div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={draw2ConfirmDeck} style={{ ...bp, fontSize: 12 }}>✅ Keep</button>
                  <button onClick={draw2RejectDeck} style={{ ...bs, fontSize: 12 }}>❌ Put back</button>
                </div>
              </div>}
              
              {/* Pool + Deck row */}
              {!draw2DeckCard && <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Pool & Deck — click to draw ({2 - draw2Picks.length} remaining)</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {artistPool.map((a, i) => {
                    const agentsOnIt = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                    return <div key={i} style={{ position: "relative" }}>
                      <ArtistCard artist={a} showCost small onClick={() => { if (draw2Picks.length < 2) draw2PickFromPool(i); }} />
                      {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                        {agentsOnIt.map(([pid], ai) => {
                          const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                          return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #1e1b4b" }}>🕵️</div>;
                        })}
                      </div>}
                    </div>;
                  })}
                  <button onClick={() => { if (draw2Picks.length < 2) draw2PickFromDeck(); }} disabled={artistDeck.length === 0 || draw2Picks.length >= 2} style={{ ...bs, fontSize: 24, padding: "16px 20px", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.1)", border: "1px dashed #7c3aed", color: "#c4b5fd", opacity: (artistDeck.length === 0 || draw2Picks.length >= 2) ? 0.3 : 1 }}>
                    📦<span style={{ fontSize: 10 }}>Deck ({artistDeck.length})</span>
                  </button>
                </div>
              </div>}
              
              {(currentPD.amenities || []).some(a => a.type === "portaloo") && draw2Picks.length === 0 && <button onClick={() => setArtistAction("spendPortaloo")} style={{ ...bs, fontSize: 11, marginTop: 6, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🚽 Spend a Portaloo to refresh the pool</button>}
              {objectivesToggle}{popupObjectivesPanel}
              <div><button onClick={() => {
                if (draw2DeckCard) setArtistDeck(prev => [...prev, draw2DeckCard]);
                draw2Picks.forEach(a => setArtistPool(prev => [...prev, a]));
                setDraw2Picks([]); setDraw2DeckCard(null); setTurnAction(null); setArtistAction(null);
              }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button></div>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "spendPortaloo" && !pendingPortalooRefresh && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🚽 Select a portaloo on your board to sacrifice</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Sacrifice a portaloo to refresh the pool. Browse the new artists, then pick one or refresh again.</p>
              <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} stageColors={currentPD.stageColors || []} onHexClick={(col, row) => {
                const am = currentPD.amenities.find(a => a.col === col && a.row === row && a.type === "portaloo");
                if (!am) return;
                setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: p[currentPlayerId].amenities.filter(a => !(a.col === col && a.row === row && a.type === "portaloo")) } }));
                addLog(currentPlayer.festivalName, `Sacrificed 🚽 portaloo`);
                sfx.placeAmenity();
                refreshPool(1);
                trackGoalProgress(currentPlayerId, "portalooRefreshes");
                setPendingPortalooRefresh(1); // 1 = first refresh done
                setTimeout(() => recalcTickets(), 50);
              }} onHexHover={setHoverHex} hoverHex={hoverHex} />
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}
            {!actionTaken && turnAction === "artist" && artistAction === "spendPortaloo" && pendingPortalooRefresh && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🚽 Refreshed pool! {pendingPortalooRefresh === 1 ? "Pick an artist or refresh again." : "Pick an artist."}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small onClick={() => {
                  const newPool = [...artistPool]; newPool.splice(i, 1); setArtistPool(newPool);
                  setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...(p[currentPlayerId].hand || []), a] } }));
                  addLog(currentPlayer.festivalName, `Picked up ${a.name} from refreshed pool`);
                  showFloatingBonus(`+🎤 ${a.name}`, "#60a5fa");
                  setPendingPortalooRefresh(0);
                  setArtistAction(null); setTurnAction(null); setActionTaken(true);
                  setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
                  setTimeout(() => recalcTickets(), 50);
                }} />)}
              </div>
              {pendingPortalooRefresh === 1 && <button onClick={() => {
                refreshPool(1);
                trackGoalProgress(currentPlayerId, "portalooRefreshes");
                addLog(currentPlayer.festivalName, `Refreshed pool again`);
                showFloatingBonus("🚽 ×2!", "#60a5fa");
                setPendingPortalooRefresh(2);
              }} style={{ ...bs, background: "rgba(96,165,250,0.2)", border: "1px solid #60a5fa", color: "#60a5fa", marginBottom: 8 }}>🔄 Refresh again (5 more new artists)</button>}
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "deckReveal" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 12 }}>You drew {Array.isArray(deckDrawnCard) ? deckDrawnCard.length : 1} card{Array.isArray(deckDrawnCard) && deckDrawnCard.length > 1 ? "s" : ""} from the deck!</p>
              {!deckCardRevealed ? (
                <div onClick={handleRevealDeckCard} style={{
                  width: 150, height: 190, borderRadius: 12, margin: "0 auto", cursor: "pointer",
                  background: "linear-gradient(135deg, #312e81, #1e1b4b)", border: "2px solid #7c3aed",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "transform 0.2s",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🎴</div>
                  <p style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 600 }}>Click to reveal!</p>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Choose 1 to keep. The other will replace a pool artist.</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {(Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard]).map((a, i) => <div key={i} style={{ cursor: "pointer" }} onClick={() => Array.isArray(deckDrawnCard) && deckDrawnCard.length > 1 ? handlePickDeckCard(i) : handlePickDeckCard(0)}>
                      <ArtistCard artist={a} showCost />
                      <button style={{ ...bp, marginTop: 4, width: "100%", fontSize: 11 }}>Keep {a.name}</button>
                    </div>)}
                  </div>
                </div>
              )}
              <button onClick={() => { if (deckDrawnCard) { const cards = Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard]; setArtistDeck(prev => [...prev, ...cards]); } setArtistAction(null); setDeckDrawnCard(null); setDeckCardRevealed(false); }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel (put back)</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "deckSwapPool" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Choose a pool artist to replace with {(Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard)?.name}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
                <div style={{ padding: 8, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid #fbbf2440" }}>
                  <p style={{ fontSize: 10, color: "#fbbf24", marginBottom: 4 }}>Going to pool:</p>
                  <ArtistCard artist={Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard} small />
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8 }}>Click a pool artist to discard and swap (🕵️ = agent claimed, can't swap):</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const hasAgentOn = Object.values(agentPlacements).some(p => p && p.type === "pool" && p.artistName === a.name);
                  return <div key={i} style={{ cursor: hasAgentOn ? "not-allowed" : "pointer", opacity: hasAgentOn ? 0.4 : 1, position: "relative" }} onClick={() => { if (!hasAgentOn) handleDeckSwapPool(i); }}>
                    <ArtistCard artist={a} small />
                    {hasAgentOn && <div style={{ position: "absolute", top: -4, right: -4, background: "#1d4ed8", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #60a5fa" }}>🕵️</div>}
                  </div>;
                })}
              </div>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "pickStage" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600 }}>Select a stage for {selectedArtist?.artist?.name} (click a stage on the right)</p>
              <button onClick={() => { setArtistAction(null); setSelectedArtist(null); }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button>
            </div>}

            {noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>⚠️ No turns remaining!</p>
              <button onClick={endTurn} style={{ ...bd, marginTop: 8 }}>End Turn →</button>
            </div>}
          </div>
        </div>
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: EVENTS (placeholder)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // RENDER: SPECIAL GUEST PHASE
  // ═══════════════════════════════════════════════════════════
  if (phase === "specialGuest") {
    const sgPlayer = players[specialGuestPlayer];
    const sgPd = sgPlayer ? playerData[sgPlayer.id] : {};
    const sgArtist = specialGuestCard;
    const affordable = sgArtist ? canAffordSpecialGuest(sgArtist, sgPd) : false;

    // If no card drawn yet, trigger setup for current player
    if (!sgArtist && sgPlayer) {
      setTimeout(() => setupSpecialGuestForPlayer(specialGuestPlayer), 100);
    }

    return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {sgArtist ? <div style={{ ...card, textAlign: "center", maxWidth: 520, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🌟 Special Guest — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{sgPlayer?.festivalName}</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>A special guest wants to headline! Fame level is ignored — you just need the amenities.</p>
          <div style={{ display: "inline-block", marginBottom: 16 }}><ArtistCard artist={sgArtist} showCost /></div>
          {affordable ? <>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✅ You can afford this guest!</p>
            <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Choose a stage (must have exactly 2 artists):</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {specialGuestEligible.map(si => {
                const sName = (sgPd.stageNames || [])[si] || `Stage ${si + 1}`;
                const sColor = (sgPd.stageColors || [])[si] || "#7c3aed";
                const sa = (sgPd.stageArtists || [])[si] || [];
                return <button key={si} onClick={() => placeSpecialGuest(si)} style={{ padding: 12, borderRadius: 12, border: `2px solid ${sColor}`, background: `${sColor}20`, color: "#e2e8f0", cursor: "pointer", minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: sColor, fontSize: 13 }}>{sName}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{sa.map(a => a.name).join(", ")}</div>
                </button>;
              })}
            </div>
          </> : <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>❌ You can't afford this guest's amenity requirements.</p>}
          <button onClick={declineSpecialGuest} style={{ ...bs, fontSize: 13 }}>{affordable ? "Decline Guest" : "Continue →"}</button>
        </div> : <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24 }}>🌟 Special Guests</h2>
          <p style={{ color: "#8b5cf6", marginTop: 8 }}>Checking for eligible festivals...</p>
        </div>}
      </div>{anim}</div>
    );
  }

  if (phase === "yearEndEffects") {
    const yep = players[yearEndEffectsPlayer];
    const yepd = yep ? playerData[yep.id] : {};
    const effects = yearEndEffectsList[yep?.id] || [];
    const currentEffect = effects[yearEndEffectIdx];

    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 550, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🎸 Year-End Effects — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{yep?.festivalName}</h3>
          
          {currentEffect && <div style={{ animation: "fadeSlideIn 0.3s" }}>
            <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={currentEffect.artist} showCost /></div>
            <p style={{ color: "#e9d5ff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✨ {currentEffect.artist.effect}</p>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>{currentEffect.desc}</p>

            {/* Auto-resolve effects — just show result and continue button */}
            {(currentEffect.type === "autoVP" || currentEffect.type === "fameVP" || currentEffect.type === "autoVPTix") && <div>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.15)", marginBottom: 16 }}>
                {currentEffect.autoVP > 0 && <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{currentEffect.autoVP} ⭐ VP</p>}
                {currentEffect.autoVP < 0 && <p style={{ color: "#ef4444", fontSize: 20, fontWeight: 900 }}>{currentEffect.autoVP} ⭐ VP</p>}
                {currentEffect.autoTix > 0 && <p style={{ color: "#fbbf24", fontSize: 20, fontWeight: 900 }}>+{currentEffect.autoTix} 🎟️ Tickets</p>}
              </div>
              <button onClick={() => resolveYearEndEffect()} style={bp}>Continue →</button>
            </div>}

            {/* Dice roll effects — interactive */}
            {(currentEffect.type === "rollUnique" || currentEffect.type === "rollCommon") && !yearEndDiceRoll && <div>
              <button onClick={() => {
                const rollCount = 5;
                setYearEndDiceRoll({ count: rollCount, rolled: false, results: null });
              }} style={{ ...bp, fontSize: 18, padding: "14px 32px", animation: "pulse 1.5s infinite" }}>🎲 ROLL {5} DICE!</button>
            </div>}

            {yearEndDiceRoll && !yearEndDiceRoll.rolled && <div>
              <button onClick={() => {
                const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, yearEndDiceRoll.count);
                setYearEndDiceRoll({ ...yearEndDiceRoll, results, rolled: true });
                sfx.rollDice();
              }} style={{ ...bp, fontSize: 18, padding: "14px 32px", animation: "pulse 1.5s infinite" }}>🎲 ROLL!</button>
            </div>}

            {yearEndDiceRoll?.rolled && <div style={{ animation: "fadeSlideIn 0.3s" }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                {yearEndDiceRoll.results.map((d, i) => <div key={i} style={{
                  width: 56, height: 56, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  background: d === "fame" ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: d === "fame" ? "2px solid #fbbf24" : "2px solid #7c3aed",
                }}>{d === "fame" ? "🔥" : AMENITY_ICONS[d] || "?"}</div>)}
              </div>
              {(() => {
                let vpGain = 0;
                if (currentEffect.type === "rollUnique") {
                  vpGain = new Set(yearEndDiceRoll.results).size;
                } else {
                  const c = {}; yearEndDiceRoll.results.forEach(d => { c[d]=(c[d]||0)+1; }); vpGain = Math.max(...Object.values(c));
                }
                return <div style={{ padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.15)", marginBottom: 16 }}>
                  <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{vpGain} ⭐ VP</p>
                  <p style={{ color: "#94a3b8", fontSize: 12 }}>{currentEffect.type === "rollUnique" ? `${vpGain} unique results` : `Best streak of ${vpGain}`}</p>
                </div>;
              })()}
              <button onClick={() => {
                let vpGain = 0;
                if (currentEffect.type === "rollUnique") vpGain = new Set(yearEndDiceRoll.results).size;
                else { const c = {}; yearEndDiceRoll.results.forEach(d => { c[d]=(c[d]||0)+1; }); vpGain = Math.max(...Object.values(c)); }
                resolveYearEndEffect({ vp: vpGain });
                setYearEndDiceRoll(null);
              }} style={bp}>Continue →</button>
            </div>}
          </div>}

          {!currentEffect && <div>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>No year-end effects for this player.</p>
            <button onClick={() => advanceYearEndEffect()} style={bp}>Continue →</button>
          </div>}

          <p style={{ color: "#64748b", fontSize: 10, marginTop: 16 }}>Effect {yearEndEffectIdx + 1}/{effects.length} • Player {yearEndEffectsPlayer + 1}/{players.length}</p>
        </div>
      </div>{anim}</div>);
  }

  if (phase === "events") {
    const evtPlayer = players[eventPhasePlayer];
    const evtRes = evtPlayer ? eventPhaseResults?.[evtPlayer.id] : null;
    const evtPd = evtPlayer ? playerData[evtPlayer.id] : {};
    const maxDelegate = evtRes ? Math.min(evtRes.secCount, Math.ceil(evtRes.totalNeg / 2)) : 0;

    return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🎭 Events Phase — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 4 }}>{evtPlayer?.festivalName}'s Festival</h3>
          <p style={{ color: "#64748b", fontSize: 11, marginBottom: 16 }}>Drew {evtRes?.allDrawn?.length || 0} personal events (3 base + {(evtPd.stages||[]).length} stages)</p>

          {eventPhaseStep === "delegate" && evtRes && <>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.1)", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 6 }}>You have <strong style={{ color: "#fbbf24" }}>{evtRes.secCount} 👮‍♀️ security</strong> on your board.</div>
              <div style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 6 }}>You will be hit by <strong style={{ color: "#ef4444" }}>{evtRes.totalNeg} 🔴 negative event{evtRes.totalNeg !== 1 ? "s" : ""}</strong> this year{evtRes.totalNeg > 0 ? "" : " — lucky!"}.</div>
              {evtRes.positive.length > 0 && <div style={{ fontSize: 12, color: "#c4b5fd" }}>You also have <strong style={{ color: "#4ade80" }}>{evtRes.positive.length} 🟢 positive event{evtRes.positive.length !== 1 ? "s" : ""}</strong>.</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginBottom: 8 }}>How many security do you want to sacrifice to block negative events?</div>
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 12 }}>Sacrificed security will be removed from your board at random positions.</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                <button onClick={() => setSecurityDelegation(d => Math.max(0, d - 1))} disabled={securityDelegation <= 0} style={{ ...bs, padding: "8px 16px", fontSize: 18, opacity: securityDelegation <= 0 ? 0.3 : 1 }}>−</button>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", minWidth: 60, textAlign: "center" }}>{securityDelegation}</div>
                <button onClick={() => setSecurityDelegation(d => Math.min(maxDelegate, d + 1))} disabled={securityDelegation >= maxDelegate} style={{ ...bs, padding: "8px 16px", fontSize: 18, opacity: securityDelegation >= maxDelegate ? 0.3 : 1 }}>+</button>
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Each security blocks 2 events • Max: {maxDelegate} security needed</div>
            </div>
            <button onClick={confirmSecurityDelegation} style={bp}>Confirm → Reveal Events</button>
          </>}

          {eventPhaseStep === "results" && <>
            <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(124,58,237,0.1)", fontSize: 12, color: "#94a3b8" }}>
              👮‍♀️ Sacrificed: {securityDelegation} (blocks {securityDelegation * 2}) • 🔴 Total negative: {evtRes?.totalNeg || 0} • 🛡️ Blocked: {(evtRes?.blocked || []).length}
            </div>
            {(evtRes?.positive || []).length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>🟢 Positive Events ({evtRes.positive.length})</div>
              {evtRes.positive.map((e, i) => <div key={i} style={{ padding: 8, borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", marginBottom: 4, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.desc}</div>
                <div style={{ fontSize: 11, color: "#34d399", marginTop: 2 }}>{e.result}</div>
              </div>)}
            </div>}
            {(evtRes?.negative || []).length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>🔴 Unblocked Negative Events ({evtRes.negative.length})</div>
              {evtRes.negative.map((e, i) => <div key={i} style={{ padding: 8, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", marginBottom: 4, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.desc}</div>
                <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 2 }}>{e.result}</div>
              </div>)}
            </div>}
            {(evtRes?.blocked || []).length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 6 }}>🛡️ Blocked ({evtRes.blocked.length})</div>
              {evtRes.blocked.map((e, i) => <div key={i} style={{ padding: 6, borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid #3b82f640", marginBottom: 4, textAlign: "left", opacity: 0.6 }}>
                <div style={{ fontSize: 11, color: "#60a5fa", textDecoration: "line-through" }}>{e.name} — {e.result}</div>
              </div>)}
            </div>}
            {(evtRes?.positive || []).length === 0 && (evtRes?.negative || []).length === 0 && (evtRes?.blocked || []).length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No events affected this festival.</p>}
            <button onClick={advanceEventPhase} style={bp}>{eventPhasePlayer < players.length - 1 ? `Apply & Next Player →` : `Apply & Go to Scoring →`}</button>
          </>}
        </div>
      </div>{anim}</div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: ROUND END
  // ═══════════════════════════════════════════════════════════
  if (phase === "roundEnd") return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, maxWidth: 600, width: "100%", textAlign: "center" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 4 }}>🎉 Year {year} Complete!</h2>
          <p style={{ color: "#8b5cf6", marginBottom: 20, fontSize: 14 }}>Ticket sales revealed lowest → highest</p>
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: "2px solid #7c3aed" }}>
                <th style={{ padding: "6px 10px", textAlign: "left", color: "#c4b5fd" }}>Festival</th>
                {[1, 2, 3, 4].map(y => <th key={`r${y}`} colSpan={y <= year ? 2 : 1} style={{ padding: "6px 8px", textAlign: "center", color: y <= year ? "#c4b5fd" : "#3b3564", borderLeft: "1px solid #2a2a4a" }}>Yr {y}</th>)}
                <th style={{ padding: "6px 10px", textAlign: "center", color: "#fbbf24", borderLeft: "1px solid #2a2a4a" }}>VP</th>
              </tr>
              <tr style={{ borderBottom: "1px solid #2a2a4a" }}>
                <th />
                {[1, 2, 3, 4].map(y => y <= year ? <>{<th key={`pre${y}`} style={{ padding: "4px 6px", textAlign: "center", color: "#8b5cf6", fontSize: 9, borderLeft: "1px solid #2a2a4a" }}>Pre🔥</th>}{<th key={`post${y}`} style={{ padding: "4px 6px", textAlign: "center", color: "#fbbf24", fontSize: 9 }}>Post🔥</th>}</> : <th key={`e${y}`} style={{ borderLeft: "1px solid #2a2a4a" }} />)}
                <th />
              </tr></thead>
              <tbody>{sortedPlayersForReveal.map((p, idx) => {
                const rev = idx <= revealIndex;
                return <tr key={p.id} style={{ background: idx % 2 === 0 ? "rgba(124,58,237,0.08)" : "transparent", opacity: rev ? 1 : 0.2, transition: "opacity 0.5s" }}>
                  <td style={{ padding: "6px 10px", fontWeight: 600, fontSize: 12 }}>{rev ? p.festivalName : "???"}</td>
                  {[1, 2, 3, 4].map(y => {
                    if (y > year) return <td key={`e${y}`} style={{ padding: "6px 8px", textAlign: "center", color: "#3b3564", borderLeft: "1px solid #2a2a4a" }}>—</td>;
                    const td = allTickets[p.id]?.[y];
                    const raw = typeof td === "object" ? (td?.raw || 0) : (td || 0);
                    const fame = typeof td === "object" ? (td?.fame ?? "?") : "?";
                    const fameVP = typeof td === "object" ? (td?.fameVP || 0) : 0;
                    const ticketVP = typeof td === "object" ? (td?.ticketVP || 0) : 0;
                    const postFame = raw;
                    return rev ? <>{<td key={`pre${y}`} style={{ padding: "6px 6px", textAlign: "center", color: "#94a3b8", fontSize: 11, borderLeft: "1px solid #2a2a4a" }}>{raw}</td>}{<td key={`post${y}`} style={{ padding: "6px 6px", textAlign: "center", color: "#e2e8f0", fontWeight: 600, fontSize: 11 }}>{postFame}<span style={{ fontSize: 8, color: "#8b5cf6" }}> (🔥{fame})</span></td>}</> : <>{<td key={`pre${y}`} style={{ borderLeft: "1px solid #2a2a4a", textAlign: "center", color: "#3b3564" }}>?</td>}{<td key={`post${y}`} style={{ textAlign: "center", color: "#3b3564" }}>?</td>}</>;
                  })}
                  <td style={{ padding: "6px 10px", textAlign: "center", color: "#fbbf24", fontWeight: 700, borderLeft: "1px solid #2a2a4a" }}>{rev ? playerData[p.id]?.vp || 0 : "?"}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          {!leaderboardRevealed ? <button onClick={revealNext} style={bp}>{revealIndex < players.length - 1 ? "Reveal Next 🥁" : "Reveal All! 🎉"}</button> : <button onClick={proceedFromRoundEnd} style={bp}>{year >= 4 ? "See Final Results 🏆" : "Continue →"}</button>}
        </div>
      </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: PRE-ROUND
  // ═══════════════════════════════════════════════════════════
  if (phase === "preRound") {
    const prp = currentPreRoundPlayer; const prpd = prp ? playerData[prp.id] : {};
    const stageCount = (prpd.stages || []).length;
    const freeCount = getPreRoundDrawCount(prpd);
    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {preRoundStep === "notify" && prp && <div style={{ ...card, textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 8 }}>🎪 {prp.festivalName} — Between Years</h2>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 4 }}>Fame: {prpd.fame || 0} | Stages: {stageCount}</p>
          {canOpenStage && <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid #fbbf2440", marginBottom: 12 }}>
            <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>🔥 Fame 3+ — You can open a new stage!</p>
            <p style={{ color: "#94a3b8", fontSize: 11 }}>Opening a stage gives +1 Fame and more artist slots.</p>
          </div>}
          {freeCount > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", marginBottom: 12 }}>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>🎤 Draw {freeCount} free artist{freeCount > 1 ? "s" : ""}!</p>
            <p style={{ color: "#94a3b8", fontSize: 11 }}>1 free draw per stage ({stageCount} stage{stageCount > 1 ? "s" : ""}) — pick from pool or deck</p>
          </div>}
          {!canOpenStage && freeCount === 0 && <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>No stage to open and no free draws this round.</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {canOpenStage && <button onClick={acceptNewStage} style={bp}>Open New Stage 🎤</button>}
            {canOpenStage && <button onClick={declineNewStage} style={bs}>Decline Stage</button>}
            {!canOpenStage && <button onClick={() => startPreRoundDraws()} style={bp}>{freeCount > 0 ? "Draw Free Artists →" : "Continue →"}</button>}
          </div>
        </div>}
        {preRoundStep === "placeStage" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>🎤 Place your new stage</p></div><HexGrid stages={prpd.stages || []} amenities={prpd.amenities || []} onHexClick={handlePreRoundHexClick} placingStage hoverHex={hoverHex} onHexHover={setHoverHex} /></div>}
        {preRoundStep === "moveDisplaced" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#fbbf24", margin: 0, fontSize: 14, fontWeight: 600 }}>Relocate {AMENITY_ICONS[displacedAmenities[displacedPlaceIdx]?.type]} {AMENITY_LABELS[displacedAmenities[displacedPlaceIdx]?.type]} ({displacedPlaceIdx + 1}/{displacedAmenities.length})</p></div><HexGrid stages={playerData[prp.id]?.stages || []} amenities={playerData[prp.id]?.amenities || []} onHexClick={handlePreRoundHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} /></div>}
        {preRoundStep === "confirmStage" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#34d399", margin: 0, fontSize: 14, fontWeight: 600 }}>✓ Stage placed!</p></div><HexGrid stages={playerData[prp.id]?.stages || []} amenities={playerData[prp.id]?.amenities || []} onHexHover={setHoverHex} hoverHex={hoverHex} /><button onClick={confirmPreRoundStage} style={{ ...bp, marginTop: 16 }}>Continue →</button></div>}
        {preRoundStep === "preRoundDrawChoose" && prp && <div style={{ ...card, textAlign: "center", maxWidth: 440 }}>
          <h3 style={{ color: "#4ade80", marginBottom: 8 }}>🎤 Free Artist Draw ({freeAmenityPlaced + 1}/{freeAmenityCount})</h3>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>Draw 1 artist per stage you own. Pick from the pool or draw from the deck:</p>
          {artistPool.length > 0 && <div style={{ marginBottom: 12 }}>
            <p style={{ color: "#c4b5fd", fontSize: 11, marginBottom: 8 }}>Pick from Pool:</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small onClick={() => {
                const newPool = [...artistPool]; newPool.splice(i, 1); setArtistPool(newPool);
                setPlayerData(p => ({ ...p, [prp.id]: { ...p[prp.id], hand: [...(p[prp.id].hand || []), a] } }));
                addLog(prp.festivalName, `drew ${a.name} from pool (free draw)`);
                const newPlaced = freeAmenityPlaced + 1; setFreeAmenityPlaced(newPlaced);
                if (newPlaced < freeAmenityCount) setPreRoundStep("preRoundDrawChoose");
                else nextPreRound();
              }} />)}
            </div>
          </div>}
          <button onClick={() => {
            const drawn = drawFromDeck(1);
            if (drawn.length > 0) {
              setPlayerData(p => ({ ...p, [prp.id]: { ...p[prp.id], hand: [...(p[prp.id].hand || []), drawn[0]] } }));
              addLog(prp.festivalName, `drew ${drawn[0].name} from deck (free draw)`);
            }
            const newPlaced = freeAmenityPlaced + 1; setFreeAmenityPlaced(newPlaced);
            if (newPlaced < freeAmenityCount) setPreRoundStep("preRoundDrawChoose");
            else nextPreRound();
          }} style={{ ...bp, fontSize: 14 }}>📦 Draw from Deck</button>
        </div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════
  const exportGameData = () => {
    const rows = [];
    rows.push(["HEADLINERS — Game Summary"]);
    rows.push([`Winner: ${winner?.festivalName || "N/A"}`, `VP: ${winner ? playerData[winner.id]?.vp || 0 : 0}`]);
    rows.push([]);

    // Scoreboard
    const headers = ["Festival", "AI?"];
    for (let y = 1; y <= 4; y++) headers.push(`Yr${y} Raw Tickets`, `Yr${y} Fame`, `Yr${y} Multiplier`, `Yr${y} Final Tickets`);
    headers.push("Total VP");
    rows.push(headers);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      const row = [p.festivalName, p.isAI ? "Yes" : "No"];
      for (let y = 1; y <= 4; y++) {
        const td = allTickets[p.id]?.[y];
        if (td && typeof td === "object") { row.push(td.raw, td.fame, td.fameVP, td.ticketVP); }
        else { row.push(td || 0, "?", "?", td || 0); }
      }
      row.push(pd.vp || 0);
      rows.push(row);
    });

    rows.push([]); rows.push(["— Festival Details —"]); rows.push([]);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      rows.push([`Festival: ${p.festivalName}`, p.isAI ? "(AI)" : ""]);
      rows.push(["Final VP", pd.vp || 0, "Final Fame", pd.fame || 0, "Stages", (pd.stages || []).length]);
      rows.push([]);
      rows.push(["Amenity", "Count"]);
      AMENITY_TYPES.forEach(t => rows.push([AMENITY_LABELS[t], (pd.amenities || []).filter(a => a.type === t).length]));
      rows.push([]);

      (pd.stages || []).forEach((_, si) => {
        const sName = (pd.stageNames || [])[si] || `Stage ${si + 1}`;
        const sa = (pd.stageArtists || [])[si] || [];
        rows.push([`${sName} Lineup`]);
        if (sa.length === 0) { rows.push(["  (empty)"]); }
        else {
          rows.push(["  Artist", "Genre", "Fame", "Tickets", "VP", "Effect", "Role"]);
          sa.forEach((a, ai) => rows.push(["  " + a.name, a.genre, a.fame, a.tickets, a.vp, a.effect || "", ai === 2 ? "HEADLINER" : `Slot ${ai + 1}`]));
        }
        rows.push([]);
      });

      if ((pd.hand || []).length > 0) {
        rows.push(["Remaining Hand"]); rows.push(["  Artist", "Genre", "Fame", "VP"]);
        pd.hand.forEach(a => rows.push(["  " + a.name, a.genre, a.fame, a.vp]));
        rows.push([]);
      }
      const obj = playerObjectives[p.id];
      if (obj) rows.push(["Artist Objective", obj.name, obj.req]);
      (playerCouncils[p.id] || []).forEach(co => rows.push(["Council Objective", co.obj.name, co.obj.req, co.active ? "Active" : "Inactive", co.obj.benefit]));
      rows.push([]); rows.push(["───────────"]); rows.push([]);
    });

    rows.push(["— Game Log —"]);
    gameLog.forEach(e => {
      if (e.type === "header") rows.push([`[${(e.ht || "").toUpperCase()}] ${e.text}`]);
      else rows.push(["", e.label, e.text]);
    });

    const csv = rows.map(r => r.map(c => { const s = String(c ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `headliners_game_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (phase === "gameOver") return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #fbbf24, #f472b6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 GAME OVER</h1>
          {winner && <div style={{ marginBottom: 24 }}><p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700 }}>{winner.festivalName} Wins!</p><p style={{ color: "#8b5cf6", fontSize: 14 }}>with {playerData[winner.id]?.vp || 0} VP</p></div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={exportGameData} style={{ ...bs, padding: "12px 20px", fontSize: 14 }}>📊 Download Game Data</button>
            <button onClick={() => { setPhase("lobby"); setGameLog([]); setAllTickets({}); setYear(1); }} style={{ ...bp, padding: "12px 20px", fontSize: 14 }}>Play Again 🎪</button>
          </div>
        </div>
      </div>{anim}</div>
  );

  return null;
}
