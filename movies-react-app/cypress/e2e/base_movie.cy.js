import { excerpt } from "../../src/util";

let movies; // List of movies from TMDB

let movie; // Single Movie
let movieimgs; // List of Movie Posters for a particular movie
let moviereviews; // List of Reviews for a particular movie

let cast; // List of cast members for a particular movie
let crew; //List of crew members for a particular movie
let castMember; // Single cast member
let crewMember; // Single crew member
var seen = {}; //Used for filtering crew list (see crew list page tests)

describe("Base tests for pages concerned with a single movie", () => {

    before(() => {
        // Get the discover movies from TMDB and store them locally.
        cy.request(
            `https://api.themoviedb.org/3/discover/movie?api_key=${Cypress.env(
            "TMDB_KEY"
            )}&language=en-US&include_adult=false&include_video=false&page=1`
        )
            .its("body") // Take the body of HTTP response from TMDB
            .then((response) => {
            movies = response.results;
            });
    });

    beforeEach(() => {
        cy.request(
            `https://api.themoviedb.org/3/movie/${
                movies[0].id
            }?api_key=${Cypress.env("TMDB_KEY")}`
            )
            .its("body")
            .then((movieDetails) => {
                movie = movieDetails;
            });
    
        cy.request(
            `https://api.themoviedb.org/3/movie/${
                movies[0].id
            }/images?api_key=${Cypress.env("TMDB_KEY")}`
            )
            .its("body")
            .then((movieImages) => {
                movieimgs = movieImages;
            });
    });

    describe("The Movie Details page", () => {

        beforeEach(() => {
            cy.visit(`/movies/${movies[0].id}`);
        });

        it(" displays the movie header, overview and genres", () => {
            //Necessary to prevent errors when API returns double spacing.
            var title = movie.title.replace( /\s\s+/g, ' ' );
            cy.get("h3").should('contain', title)
                    .and('contain', movie.tagline)
                    .find('a').should('have.attr', 'href', movie.homepage)
                    .find('svg').should('have.attr', 'data-testid', 'HomeIcon');
            cy.get(".MuiGrid-root.MuiGrid-item").eq(1).find("h3").contains("Overview");

            //Necessary to prevent errors when API returns double spacing.
            var overview = movie.overview.replace( /\s\s+/g, ' ' );
            cy.get("p").contains(overview);
            cy.get("ul")
            .eq(0)
            .within(() => {
                const genreChipLabels = movie.genres.map((g) => g.name);
                genreChipLabels.unshift("Genres");
                cy.get("span").each(($card, index) => {
                    cy.wrap($card).contains(genreChipLabels[index]);
                });
            });
        });

        it(" displays the movie posters in a carousel", () => {
            cy.get(".MuiGrid-root")
            .eq(0)
            .find(".MuiGrid-root.MuiGrid-item")
            .eq(0)
            .within(() => {
                var imgPath = movieimgs.posters.map((image) => image.file_path);
                cy.get("div").find("img").each(($img, index) => {
                    cy.wrap($img).should('have.attr', 'src', 'https://image.tmdb.org/t/p/w500/' + imgPath[index]);
                });
            });
        });

        it(" displays the movie runtime, revenue, vote, and release date", () => {
            cy.get("ul")
            .eq(1)
            .within(() => {
                cy.get("span").contains(movie.runtime);
                cy.get("span").contains(movie.revenue.toLocaleString());
                cy.get("span").contains(movie.vote_average);
                cy.get("span").contains(movie.release_date);
            });
        });

        it(" displays the production countries and view cast/crew buttons", () => {
            cy.get("ul")
            .eq(2)
            .within(() => {
                const countryChipLabels = movie.production_countries.map((g) => g.name);
                countryChipLabels.unshift("Production Countries");
                cy.get("span").each(($card, index) => {
                    cy.wrap($card).contains(countryChipLabels[index]);
                });
            });
            cy.get("button").contains("View Cast", { matchCase: false });
            cy.get("button").contains("View Crew", { matchCase: false });
        });

        it(" displays the reviews button", () => {
            cy.get("button.MuiButtonBase-root.MuiFab-root").contains("Reviews", { matchCase: false });
        });
    });

    describe("Reviews", () => {

        before(() => {
            cy.request(
                `https://api.themoviedb.org/3/movie/${
                    movies[0].id
                }/reviews?api_key=${Cypress.env("TMDB_KEY")}`
                )
                .its("body")
                .then((movieReviews) => {
                    moviereviews = movieReviews.results;
            });
        });

        beforeEach(() => {
            cy.visit(`/movies/${movies[0].id}`);
            cy.get("button.MuiButtonBase-root.MuiFab-root").contains("Reviews", { matchCase: false }).click();
        });

        describe("Review excerpts", () => {

            it("displays the correct headings for the excerpts view", () => {
                cy.get('thead').find('tr').within(() => {
                    cy.get("th").eq(0).contains("Author");
                    cy.get("th").eq(1).contains("Excerpt");
                    cy.get("th").eq(2).contains("More");
                });
            });

            it("displays correct review excerpts", () => {
                cy.get("tbody").find('tr').each(($review, index) => {
                    //Verify author name
                    //Necessary to prevent errors when API returns double spacing.
                    var author = moviereviews[index].author.replace( /\s\s+/g, ' ' );
                    cy.wrap($review).find("th").contains(author);
                });
            });

            it("displays link to review details for each review", () => {
                cy.get("tbody").find('tr').each(($review, index) => {
                    var id = moviereviews[index].id;
                    cy.wrap($review).find("td").eq(1).should('contain',"Full Review")
                        .find("a").should('have.attr', 'href', '/reviews/' + id);
                });
            });
        });

        describe("The Review Details page", () => {

            beforeEach(() => {
                cy.visit(`/movies/${movies[0].id}`);
                cy.get("button.MuiButtonBase-root.MuiFab-root").contains("Reviews", { matchCase: false }).click();
                cy.get("tbody").find('tr').eq(0).find('td').eq(1).find("a").click();
            });

            it("navigates to the review details page", () => {
                cy.url().should('eq', 'http://localhost:3000/reviews/' + moviereviews[0].id);
            });

            it("displays correct movie title, homepage link, and tagline", () => {
                cy.get("h3").should('contain', movie.title)
                    .and('contain', movie.tagline)
                    .find('a').should('have.attr', 'href', movie.homepage)
                    .find('svg').should('have.attr', 'data-testid', 'HomeIcon');
            });

            it("displays the correct movie posters as a carousel", () => {
                cy.get(".MuiGrid-root")
                    .eq(0)
                    .find(".MuiGrid-root.MuiGrid-item")
                    .eq(0)
                    .within(() => {
                        var imgPath = movieimgs.posters.map((image) => image.file_path);
                        cy.get("div").find("img").each(($img, index) => {
                            cy.wrap($img).should('have.attr', 'src', 'https://image.tmdb.org/t/p/w500/' + imgPath[index]);
                        });
                    });
            });

            it("displays the correct review details", () => {
                cy.get(".MuiGrid-root")
                    .eq(0)
                    .find(".MuiGrid-root.MuiGrid-item")
                    .eq(1)
                    .within(() => {
                        var author = moviereviews[0].author.replace( /\s\s+/g, ' ' );
                        cy.get('p').eq(0).should('contain', "Review By:").and('contain', author);
                    });
            });
        });
    });

    describe("The Cast List page", () => {

        before(() => {
            cy.request(
                `https://api.themoviedb.org/3/movie/${
                    movies[0].id
                }/credits?api_key=${Cypress.env("TMDB_KEY")}`
                )
                .its("body")
                .then((castList) => {
                    cast = castList.cast;
                });
        });

        beforeEach(() => {
            cy.visit(`/movies/${movies[0].id}/cast`);
        });

        it("displays the page header and 11 cast members on first load", () => {
            cy.get("h3").contains("Cast");
            cy.get(".MuiCardHeader-root").should("have.length", 11);
        });

        it("displays the 'Search Cast' card and all relevant filter/sort fields", () => {
            cy.get(".MuiGrid-root.MuiGrid-container")
            .eq(1)
            .find(".MuiGrid-root.MuiGrid-item")
            .eq(0)
            .within(() => {
                cy.get("h1").contains("Search Cast");
                //Check if Input and Select fields are as expected
                cy.get("[id='filled-search']").eq(0).should('have.class',
                    "MuiInputBase-input MuiFilledInput-input MuiInputBase-inputTypeSearch");
                cy.get(".MuiFormControl-root").eq(0).find('label').contains('By Actor');
                cy.get("input").eq(1).should('have.class',
                    "MuiInputBase-input MuiFilledInput-input MuiInputBase-inputTypeSearch");
                cy.get(".MuiFormControl-root").eq(1).find('label').contains('By Character');
                cy.get("[id='sort-select']").should('have.class', "MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input")
                //Check if Movies are sorted by popularity by default
                .contains("Relevance");
                cy.get(".MuiFormControl-root").eq(2).find('label').contains('Sort By');
            });
        });

        describe("Cast Information", () => {
            it("displays the correct cast names", () => {
                //API sorts by role significance by default - no need to sort cast
                
                //Confirm Name is correct and links to person page
                cy.get(".MuiCardHeader-content").each(($card, index) => {
                    //Necessary to prevent errors when API returns double spacing.
                    var name = cast[index].name.replace( /\s\s+/g, ' ' );
                    cy.wrap($card).find("p").find("a").should('contain', name)
                        .and('have.attr', 'href', '/person/' + cast[index].id);
                });
            });

            it("displays the correct cast images", () => {
                cy.get(".MuiCardMedia-root").each(($card, index) => {
                    //Check if cast member has image or one of the expected default images
                    if (cast[index].profile_path) {
                        var image = "https://image.tmdb.org/t/p/w500/" + cast[index].profile_path;
                        cy.wrap($card).should('have.attr', 'style', 'background-image: url("' + image + '");');
                    }
                    //If female, check cast member has female default image
                    else if (cast[index].gender === 1){
                        cy.fixture('../../src/images/female-person-placeholder.jpg').then((female) => {
                            cy.wrap($card).should('have.attr', 'style', 'background-image: url("data:image/jpeg;base64,' + female + '");');
                        });
                    }
                    //If male or other, check cast member has male default image
                    else {
                        cy.fixture('../../src/images/male-person-placeholder.jpg').then((male) => {
                            cy.wrap($card).should('have.attr', 'style', 'background-image: url("data:image/jpeg;base64,' + male + '");');
                        });
                    }
                });
            });

            it("displays the correct character names", () => {
                cy.get(".MuiCardContent-root > p").each(($card, index) => {
                    var character = cast[index].character;
                    cy.wrap($card).should('contain', character);
                });
            });
        });
    });

    describe("The Crew List page", () => {

        before(() => {
            cy.request(
                `https://api.themoviedb.org/3/movie/${
                    movies[0].id
                }/credits?api_key=${Cypress.env("TMDB_KEY")}`
                )
                .its("body")
                .then((crewList) => {
                    //Filter Crew List so crew members with multiple jobs are displayed in one person card rather than multiple jobs
                    crew = crewList.crew.filter(function(entry) {
                        var previous;
        
                        if (seen.hasOwnProperty(entry.id)) {
                            previous = seen[entry.id];
                            previous.job = previous.job + ', ' + entry.job;
                            return false;
                        }
        
                        seen[entry.id] = entry;
                        return true;
                    });;
                });
        });

        beforeEach(() => {
            cy.visit(`/movies/${movies[0].id}/crew`);
        });

        it("displays the page header and 11 crew members on first load", () => {
            cy.get("h3").contains("Crew");
            cy.get(".MuiCardHeader-root").should("have.length", 11);
        });

        it("displays the 'Search Crew' card and all relevant filter/sort fields", () => {
            cy.get(".MuiGrid-root.MuiGrid-container")
            .eq(1)
            .find(".MuiGrid-root.MuiGrid-item")
            .eq(0)
            .within(() => {
                cy.get("h1").contains("Search Crew");
                //Check if Input and Select fields are as expected
                cy.get("[id='filled-search']").eq(0).should('have.class',
                    "MuiInputBase-input MuiFilledInput-input MuiInputBase-inputTypeSearch");
                cy.get(".MuiFormControl-root").eq(0).find('label').contains('By Name');
                cy.get("input").eq(1).should('have.class',
                    "MuiInputBase-input MuiFilledInput-input MuiInputBase-inputTypeSearch");
                cy.get(".MuiFormControl-root").eq(1).find('label').contains('By Job');
                cy.get("[id='sort-select']").should('have.class', "MuiSelect-select MuiSelect-outlined MuiInputBase-input MuiOutlinedInput-input")
                .contains("Default");
                cy.get(".MuiFormControl-root").eq(2).find('label').contains('Sort By');
            });
        });

        describe("Crew Information", () => {
            it("displays the correct crew names and links to their details page", () => {
                cy.get(".MuiCardHeader-content").each(($card, index) => {
                    //Necessary to prevent errors when API returns double spacing.
                    var name = crew[index].name.replace( /\s\s+/g, ' ' );
                    cy.wrap($card).find("p").find("a").should('contain', name)
                        .and('have.attr', 'href', '/person/' + crew[index].id);
                });
            });

            it("displays the correct crew images", () => {
                cy.get(".MuiCardMedia-root").each(($card, index) => {
                    //Check if crew member has image or one of the expected default images
                    if (crew[index].profile_path) {
                        var image = "https://image.tmdb.org/t/p/w500/" + crew[index].profile_path;
                        cy.wrap($card).should('have.attr', 'style', 'background-image: url("' + image + '");');
                    }
                    //If female, check crew member has female default image
                    else if (crew[index].gender === 1){
                        cy.fixture('../../src/images/female-person-placeholder.jpg').then((female) => {
                            cy.wrap($card).should('have.attr', 'style', 'background-image: url("data:image/jpeg;base64,' + female + '");');
                        });
                    }
                    //If male or other, check crew member has male default image
                    else {
                        cy.fixture('../../src/images/male-person-placeholder.jpg').then((male) => {
                            cy.wrap($card).should('have.attr', 'style', 'background-image: url("data:image/jpeg;base64,' + male + '");');
                        });
                    }
                });
            });

            it("displays the correct job(s) for each crew member", () => {
                cy.get(".MuiCardContent-root > p").each(($card, index) => {
                    var job = crew[index].job;
                    cy.wrap($card).should('contain', job);
                });
            });
        });
    });

    describe("The Person Details page", () => {

        before(() => {
            cy.request(
            `https://api.themoviedb.org/3/person/${
                cast[0].id
            }?api_key=${Cypress.env("TMDB_KEY")}`
            )
            .its("body")
            .then((castDetails) => {
                castMember = castDetails;
            });

            cy.request(
            `https://api.themoviedb.org/3/person/${
                crew[0].id
            }?api_key=${Cypress.env("TMDB_KEY")}`
            )
            .its("body")
            .then((crewDetails) => {
                crewMember = crewDetails;
            });
        });

        describe("Cast Version", () => {

            beforeEach(() => {
                cy.visit(`/person/${cast[0].id}`);
            });

            it("displays the cast member's name as the header", () => {
                var name = castMember.name.replace( /\s\s+/g, ' ' );
                cy.get("h3").contains(name);
            });

            it("displays the cast member's biography", () => {
                //Check if cast member displays their biography or, if no biography present,
                //displays the default 'Biography unavailable' message
                if (castMember.biography) {
                    var biography = castMember.name.replace( /\s\s+/g, ' ' );
                    cy.get(".MuiGrid-root.MuiGrid-item").eq(1).find("h3").contains("Biography");
                    cy.get("p").contains(biography);
                }
                else {
                    var name = castMember.name.replace( /\s\s+/g, ' ' );
                    cy.get(".MuiGrid-root.MuiGrid-item").eq(1).find("h3").contains("Biography for " + name + " unavailable");
                }
            });

            it("displays the cast member's image", () => {
                if (castMember.profile_path) {
                    var image = "https://image.tmdb.org/t/p/w500/" + castMember.profile_path;
                    cy.get('img').should('have.attr', 'src', image);
                }
                //If female, check cast member has female default image
                else if (castMember.gender === 1){
                    cy.fixture('../../src/images/female-person-placeholder.jpg').then((female) => {
                        cy.get('img').should('have.attr', 'src', 'data:image/jpeg;base64,' + female + '");');
                    });
                }
                //If male or other, check cast member has male default image
                else {
                    cy.fixture('../../src/images/male-person-placeholder.jpg').then((male) => {
                        cy.get('img').should('have.attr', 'src', 'data:image/jpeg;base64,' + male + '");');
                    });
                }
            });

            it("displays the correct DOB and age", () => {
                cy.get("ul").eq(0).within(() => {
                    //Check if values are non-empty. If empty, appropriate defaults should be displayed
                    if (castMember.birthday) cy.get("span").contains("Born: " + castMember.birthday);
                    else cy.get("span").contains("Born: N/A");

                    if (castMember.birthday) {
                        //Calculate the person's age
                        var today = new Date();
                        var birthDate = new Date(castMember.birthday);
                        var age = today.getFullYear() - birthDate.getFullYear();
                        var m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        cy.get("span").contains("Age: " + age);
                    }
                    else cy.get("span").contains("Age: Unknown");
                });


            });

            it("displays the correct gender, place of birth, and area known for", () => {
                cy.get("ul").eq(0).within(() => {
                    //Check if values are non-empty. If empty, appropriate defaults should be displayed
                    //Female - icon and pink background
                    if (castMember.gender === 1) {
                        cy.get("span").contains("Female");
                        cy.get("svg").should('have.attr', 'data-testid', 'FemaleIcon')
                            .parent().should('have.attr', 'style', 'background-color: rgb(255, 204, 255); margin: 0.25em;');
                    }
                    //Male - icon and blue background
                    else if (castMember.gender === 2) {
                        cy.get("span").contains("Male");
                        cy.get("svg").should('have.attr', 'data-testid', 'MaleIcon')
                        .parent().should('have.attr', 'style', 'background-color: rgb(153, 204, 255); margin: 0.25em;');
                    }
                    //Unknown or other
                    else cy.get("span").contains("Gender: N/B or Unknown");

                    if (castMember.place_of_birth) cy.get("span").contains("From: " + castMember.place_of_birth);
                    else cy.get("span").contains("From: N/A");
                    cy.get("svg").eq(1).should('have.attr', 'data-testid', 'PlaceIcon');

                    cy.get("span").contains("Known for: " + castMember.known_for_department);
                });
            });
        });

        describe("Crew Version", () => {
            beforeEach(() => {
                cy.visit(`/person/${crew[0].id}`);
            });

            it("displays the crew member's name as the header", () => {
                var name = crewMember.name.replace( /\s\s+/g, ' ' );
                cy.get("h3").contains(name);
            });

            it("displays the crew member's biography", () => {
                //Check if crew member displays their biography or, if no biography present,
                //displays the default 'Biography unavailable' message
                if (crewMember.biography) {
                    var biography = crewMember.name.replace( /\s\s+/g, ' ' );
                    cy.get(".MuiGrid-root.MuiGrid-item").eq(1).find("h3").contains("Biography");
                    cy.get("p").contains(biography);
                }
                else {
                    var name = crewMember.name.replace( /\s\s+/g, ' ' );
                    cy.get(".MuiGrid-root.MuiGrid-item").eq(1).find("h3").contains("Biography for " + name + " unavailable");
                }
            });

            it("displays the crew member's image", () => {
                if (crewMember.profile_path) {
                    var image = "https://image.tmdb.org/t/p/w500/" + crewMember.profile_path;
                    cy.get('img').should('have.attr', 'src', image);
                }
                //If female, check crew member has female default image
                else if (crewMember.gender === 1){
                    cy.fixture('../../src/images/female-person-placeholder.jpg').then((female) => {
                        cy.get('img').should('have.attr', 'src', 'data:image/jpeg;base64,' + female + '");');
                    });
                }
                //If male or other, check crew member has male default image
                else {
                    cy.fixture('../../src/images/male-person-placeholder.jpg').then((male) => {
                        cy.get('img').should('have.attr', 'src', 'data:image/jpeg;base64,' + male + '");');
                    });
                }
            });

            it("displays the correct DOB and age", () => {
                cy.get("ul").eq(0).within(() => {
                    //Check if values are non-empty. If empty, appropriate defaults should be displayed
                    if (crewMember.birthday) cy.get("span").contains("Born: " + crewMember.birthday);
                    else cy.get("span").contains("Born: N/A");

                    if (crewMember.birthday) {
                        //Calculate the person's age
                        var today = new Date();
                        var birthDate = new Date(crewMember.birthday);
                        var age = today.getFullYear() - birthDate.getFullYear();
                        var m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        cy.get("span").contains("Age: " + age);
                    }
                    else cy.get("span").contains("Age: Unknown");
                });


            });

            it("displays the correct gender, place of birth, and area known for", () => {
                cy.get("ul").eq(0).within(() => {
                    //Check if values are non-empty. If empty, appropriate defaults should be displayed
                    //Female - icon and pink background
                    if (crewMember.gender === 1) {
                        cy.get("span").contains("Female");
                        cy.get("svg").should('have.attr', 'data-testid', 'FemaleIcon')
                            .parent().should('have.attr', 'style', 'background-color: rgb(255, 204, 255); margin: 0.25em;');
                    }
                    //Male - icon and blue background
                    else if (crewMember.gender === 2) {
                        cy.get("span").contains("Male");
                        cy.get("svg").should('have.attr', 'data-testid', 'MaleIcon')
                        .parent().should('have.attr', 'style', 'background-color: rgb(153, 204, 255); margin: 0.25em;');
                    }
                    //Unknown or other
                    else cy.get("span").contains("Gender: N/B or Unknown");

                    if (crewMember.place_of_birth) cy.get("span").contains("From: " + crewMember.place_of_birth);
                    else cy.get("span").contains("From: N/A");
                    cy.get("svg").eq(1).should('have.attr', 'data-testid', 'PlaceIcon');

                    cy.get("span").contains("Known for: " + crewMember.known_for_department);
                });
            });
        });
    });
});