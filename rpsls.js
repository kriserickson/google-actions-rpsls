const OPTION_INSTRUCTIONS = 'Instructions';
const OPTION_START_GAME = 'Start Game';
const OPTION_AGAIN = 'Again';
const OPTION_END = 'End';

const CHOICE_ARRAY = ['rock','paper','scissors','lizard','spock'];

let getStartList = function (app) {
    let list = app.buildList('Start Game or Instructions');
    list.addItems([
        app.buildOptionItem(OPTION_START_GAME, ['Start', 'New Game']).setTitle('Start Game'),
        app.buildOptionItem(OPTION_INSTRUCTIONS, ['Help', 'Read Instructions', 'Tell Me Instructions', 'Repeat Instructions']).setTitle('Instructions')
    ]);
    return list;
};

function mainIntentHandler(app) {
    console.log('MAIN intent triggered.');
    const list = getStartList(app);
    app.askWithList(app.buildInputPrompt(true,
            `<speak>
              <p>
                  <s>Welcome to Rock, Paper, Scissors, Lizard, Spock.</s>
                  <s>If you need instructions, say Instructions.</s>
                  <s>To play the game, say Start Game</s>
              </p>
            </speak>`), list);

}

function readInstructions(app) {
    console.log('Read Instructions.');
    const list = getStartList(app);
    app.askWithList(app.buildInputPrompt(true,
    `<speak>
      <p>
        <s>Scissors cuts Paper.</s><break time=".3s"/>
        <s>Paper covers Rock.</s><break time=".5s"/>
        <s>Rock crushes Lizard.</s><break time=".3s"/>
        <s>Lizard poisons Spock.</s><break time=".3s"/>
        <s>Spock smashes Scissors.</s><break time=".3s"/>
        <s>Scissors decapitates Lizard.</s><break time=".3s"/>
        <s>Lizard eats Paper.</s><break time=".3s"/>
        <s>Paper disproves Spock.</s><break time=".3s"/>
        <s>Spock vaporizes Rock.</s><break time=".7s"/>
        <s>(and as it always has), Rock crushes Scissors</s>
      </p>
      <break time="1s"/>
      <p>
        <s>To play the game, say Start Game</s>
        <s>To repeat the instructions, say instructions</s>
      </p>
    </speak>`), list);
}

function startGame(app) {
    app.ask(app.buildInputPrompt(true,
   `<speak>
      <p>
        <s>Do you pick Rock, Paper, Scissors, Lizard or Spock</s>
      </p>
    </speak>`));
}

// React to list or carousel selection
function optionIntentHandler(app) {
    console.log('OPTION intent triggered.');
    const param = app.getSelectedOption();
    if (param === OPTION_INSTRUCTIONS) {
        readInstructions(app);
    } else if (param === OPTION_START_GAME || param === OPTION_AGAIN) {
        startGame(app);
    } else if (param === OPTION_END) {
        app.tell('Bye');
    } else {
        console.warn('Invalid choice, param = ' + param);
        const list = getStartList(app);
        app.askWithList(app.buildInputPrompt(true,
                `<speak>
              <p>
                  <s>I am sorry, I did not understand.</s>
                  <s>If you need instructions, say Instructions.</s>
                  <s>To play the game, say Start Game</s>
              </p>
            </speak>`), list);
    }
}

function returnResults(app, userChoice) {
    const computerChoice = CHOICE_ARRAY[Math.floor(Math.random() * CHOICE_ARRAY.length)];
    if (computerChoice === userChoice) {
        app.ask(app.buildInputPrompt(true,
    `<speak>
          <p>
            <s>I also picked ${userChoice}.</s>
            <s>Try again, do you pick Rock, Paper, Scissors, Lizard or Spock</s>
          </p>
        </speak>`));
    } else {
        let win = false;
        let result = '';
        if (userChoice === 'rock') {
            if (computerChoice === 'spock') {
                result = 'Spock vaporizes Rock';
            } else if (computerChoice === 'paper') {
                result = 'Paper covers Rocks';
            } else if (computerChoice === 'lizard') {
                win = true;
                result = 'Rock crushes Lizard'
            } else if (computerChoice === 'scissors') {
                win = true;
                result = 'as always, Rock crushes scissors';
            }
        } else if (userChoice === 'paper') {
            if (computerChoice === 'spock') {
                win = true;
                result = 'Paper disproves Spock';
            } else if (computerChoice === 'rock') {
                win = true;
                result = 'Paper covers Rocks';
            } else if (computerChoice === 'lizard') {
                result = 'Lizard eats Paper'
            } else if (computerChoice === 'scissors') {
                result = 'Scissors cuts Paper';
            }
        } else if (userChoice === 'scissors') {
            if (computerChoice === 'spock') {
                result = 'Spock smashes Scissors';
            } else if (computerChoice === 'rock') {
                result = 'as always, Rock crushes scissors';
            } else if (computerChoice === 'lizard') {
                win = true;
                result = 'Scissors decapitates Lizard'
            } else if (computerChoice === 'paper') {
                win = true;
                result = 'Scissors cuts Paper';
            }
        } else if (userChoice === 'lizard') {
            if (computerChoice === 'paper') {
                win = true;
                result = 'Lizard eats Paper';
            } else if (computerChoice === 'rock') {
                result = 'Rock crushes Lizard';
            } else if (computerChoice === 'spock') {
                win = true;
                result = 'Lizard poisons Spock'
            } else if (computerChoice === 'scissors') {
                result = 'Scissors decapitates Lizard';
            }
        } else if (userChoice === 'spock') {
            if (computerChoice === 'paper') {
                result = 'Paper disproves Spock';
            } else if (computerChoice === 'rock') {
                win = true;
                result = 'Spock vaporizes Rock';
            } else if (computerChoice === 'lizard') {
                result = 'Lizard poisons Spock'
            } else if (computerChoice === 'scissors') {
                win = true;
                result = 'Spock smashes Scissors';
            }
        } else {
            console.error('Impossible choice: ' + userChoice);
            app.ask('Something has gone wrong, you picked: ' + userChoice);
            return;
        }

        let list = app.buildList('Start Game or Instructions');
        list.addItems([
            app.buildOptionItem(OPTION_AGAIN, ['Start', 'Yes']).setTitle('Again'),
            app.buildOptionItem(OPTION_END, ['Stop', 'No']).setTitle('End')
        ]);

        const message = '<s>' + result + '</s>' + (win ? '<s>You Won!</s>' : '<s>You lost.</s>');

        app.askWithList(app.buildInputPrompt(true,
                `<speak>
          <p>
              ${message}
              <s>To play again, say again.</s>
              <s>To quit say end.</s>
          </p>
        </speak>`), list);


    }
}

function textIntentHandler(app) {
    const rawInput = app.getRawInput();
    let res;
    if (res = rawInput.match(/^\s*(rock|paper|scissors|lizard|spock)\s*$/i)) {
        returnResults(app, res[1].toLowerCase());
    } else {
        app.ask(app.buildInputPrompt(true,
   `<speak>
      <p>
        <s>${rawInput} is not a valid choice.</s>
        <s>Do you pick Rock, Paper, Scissors, Lizard or Spock</s>
      </p>
    </speak>`));
    }
}

module.exports = {
    mainIntentHandler: mainIntentHandler,
    optionIntentHandler: optionIntentHandler,
    textIntentHandler: textIntentHandler
};
