const OPTION_INSTRUCTIONS = 'Instructions';
const OPTION_START_GAME = 'Start Game';
const OPTION_AGAIN = 'Again';
const OPTION_END = 'End';

const GAME_CHOICES = Object.freeze({SCISSORS_VS_PAPER : 0, PAPER_VS_ROCK: 1, ROCK_VS_LIZARD: 2, LIZARD_VS_SPOCK: 3,
    SPOCK_VS_SCISSOR: 4, SCISSOR_VS_LIZARD: 5, LIZARD_VS_PAPER: 6, PAPER_VS_SPOCK: 7, SPOCK_VS_ROCK: 8, ROCK_VS_SCISSOR: 9});

const CHOICE_NAMES = Object.freeze({ROCK: 'rock', PAPER: 'paper', SCISSOR: 'scissors', LIZARD: 'lizard', SPOCK: 'spock'});

const STATES = Object.freeze({INITIAL_STATE: 0, START_GAME: 1, END_GAME: 2});

const OUTCOME_DESCRIPTIONS = {
    [GAME_CHOICES.SCISSORS_VS_PAPER] : 'Scissors cuts Paper.',
    [GAME_CHOICES.SCISSOR_VS_LIZARD]: 'Scissors decapitates Lizard.',
    [GAME_CHOICES.PAPER_VS_ROCK] : 'Paper covers Rock.',
    [GAME_CHOICES.PAPER_VS_SPOCK]: 'Paper disproves Spock.',
    [GAME_CHOICES.LIZARD_VS_SPOCK] : 'Lizard poisons Spock',
    [GAME_CHOICES.LIZARD_VS_PAPER]: 'Lizard eats Paper.',
    [GAME_CHOICES.SPOCK_VS_SCISSOR] : 'Spock smashes Scissors.',
    [GAME_CHOICES.SPOCK_VS_ROCK]: 'Spock vaporizes Rock.',
    [GAME_CHOICES.ROCK_VS_LIZARD] :'Rock crushes Lizard',
    [GAME_CHOICES.ROCK_VS_SCISSOR]: '(and as it always has), Rock crushes Scissors.'
};

const CHOICE_MATRIX = {
    [CHOICE_NAMES.ROCK + CHOICE_NAMES.SCISSOR]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_SCISSOR], win: true},
    [CHOICE_NAMES.ROCK + CHOICE_NAMES.LIZARD]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_LIZARD], win: true},
    [CHOICE_NAMES.ROCK + CHOICE_NAMES.PAPER]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_ROCK], win: false},
    [CHOICE_NAMES.ROCK + CHOICE_NAMES.SPOCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_ROCK], win: false},

    [CHOICE_NAMES.PAPER + CHOICE_NAMES.ROCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_ROCK], win: true},
    [CHOICE_NAMES.PAPER + CHOICE_NAMES.SPOCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_SPOCK], win: true},
    [CHOICE_NAMES.PAPER + CHOICE_NAMES.SCISSOR]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSORS_VS_PAPER], win: false},
    [CHOICE_NAMES.PAPER + CHOICE_NAMES.LIZARD]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_PAPER], win: false},

    [CHOICE_NAMES.SCISSOR + CHOICE_NAMES.PAPER]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSORS_VS_PAPER], win: true},
    [CHOICE_NAMES.SCISSOR + CHOICE_NAMES.LIZARD]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSOR_VS_LIZARD], win: true},
    [CHOICE_NAMES.SCISSOR + CHOICE_NAMES.ROCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_SCISSOR], win: false},
    [CHOICE_NAMES.SCISSOR + CHOICE_NAMES.SPOCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_SCISSOR], win: false},

    [CHOICE_NAMES.LIZARD + CHOICE_NAMES.SPOCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_SPOCK], win: true},
    [CHOICE_NAMES.LIZARD + CHOICE_NAMES.PAPER]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_PAPER], win: true},
    [CHOICE_NAMES.LIZARD + CHOICE_NAMES.ROCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_LIZARD], win: false},
    [CHOICE_NAMES.LIZARD + CHOICE_NAMES.SCISSOR]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSOR_VS_LIZARD], win: false},

    [CHOICE_NAMES.SPOCK + CHOICE_NAMES.SCISSOR]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_SCISSOR], win: true},
    [CHOICE_NAMES.SPOCK + CHOICE_NAMES.ROCK]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_ROCK], win: true},
    [CHOICE_NAMES.SPOCK + CHOICE_NAMES.PAPER]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_SPOCK], win: false},
    [CHOICE_NAMES.SPOCK + CHOICE_NAMES.LIZARD]: {outcome: OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_SPOCK], win: false},

};

const CHOICE_ARRAY = [CHOICE_NAMES.ROCK, CHOICE_NAMES.PAPER, CHOICE_NAMES.SCISSOR, CHOICE_NAMES.LIZARD, CHOICE_NAMES.SPOCK];

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
            </speak>`, ['Say Instructions or Start Game']), list, {state: STATES.INITIAL_STATE});

}

function readInstructions(app) {
    console.log('Read Instructions.');
    const list = getStartList(app);
    const dialogState = app.getDialogState();
    dialogState.state = STATES.INITIAL_STATE;
    app.askWithList(app.buildInputPrompt(true,
    `<speak>
      <p>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSORS_VS_PAPER]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_ROCK]}</s><break time=".5s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_LIZARD]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_SPOCK]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_SCISSOR]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.SCISSOR_VS_LIZARD]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.LIZARD_VS_PAPER]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.PAPER_VS_SPOCK]}</s><break time=".3s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.SPOCK_VS_ROCK]}</s><break time=".7s"/>
        <s>${OUTCOME_DESCRIPTIONS[GAME_CHOICES.ROCK_VS_SCISSOR]}</s>
      </p>
      <break time="1s"/>
      <p>
        <s>To play the game, say Start Game</s>
        <s>To repeat the instructions, say instructions</s>
      </p>
    </speak>`), list, dialogState);
}

function startGame(app) {
    const dialogState = app.getDialogState();
    dialogState.state = STATES.START_GAME;
    app.ask(app.buildInputPrompt(true,
   `<speak>
      <p>
        <s>Do you pick Rock, Paper, Scissors, Lizard or Spock</s>
      </p>
    </speak>`), dialogState);
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
    }
}

function returnResults(app, userChoice) {
    const computerChoice = CHOICE_ARRAY[Math.floor(Math.random() * CHOICE_ARRAY.length)];
    const dialogState = app.getDialogState();
    if (computerChoice === userChoice) {
        dialogState.state = STATES.START_GAME;
        app.ask(app.buildInputPrompt(true,
    `<speak>
          <p>
            <s>I also picked ${userChoice}.</s>
            <s>Try again, do you pick Rock, Paper, Scissors, Lizard or Spock</s>
          </p>
        </speak>`), dialogState);
    } else {
        const result = CHOICE_MATRIX[userChoice + computerChoice];
        if (!userChoice) {
            console.error('Impossible choice: ' + userChoice);
            app.ask('Something has gone wrong, you picked: ' + userChoice);
            return;
        }

        let list = app.buildList('Start Game or Instructions');
        list.addItems([
            app.buildOptionItem(OPTION_AGAIN, ['Start', 'Yes']).setTitle('Again'),
            app.buildOptionItem(OPTION_END, ['Stop', 'No']).setTitle('End')
        ]);

        dialogState.state = STATES.END_GAME;
        app.userStorage.wins = (app.userStorage.wins || 0) + (result.win ? 1 : 0);
        app.userStorage.losses = (app.userStorage.losses || 0) + (result.win ? 0 : 1);

        const winLost = result.win ? 'You Won!' : 'You lost.';

        const message = `<s>${result.outcome}</s><break time=".3s"/>
                <s>${winLost}</s>
                <break time=".5s"/>
                <s >You have won <say-as interpret-as="cardinal">${app.userStorage.wins}</say-as> games, 
                and lost <say-as interpret-as="cardinal">${app.userStorage.losses}</say-as> games.</s>
                <break time=".7s"/>`;

        app.askWithList(app.buildInputPrompt(true,
                `<speak>
          <p>
              ${message}
              <s>To play again, say again.<break time=".3s"/></s>              
              <s>To quit say end.</s>
          </p>
        </speak>`), list, dialogState);
    }
}

function textIntentHandler(app) {
    console.log('TEXT intent triggered.');
    const rawInput = app.getRawInput();
    let res;
    if (res = rawInput.match(/^\s*(rock|paper|scissors|lizard|spock)\s*$/i)) {
        returnResults(app, res[1].toLowerCase());
    } else {
        const dialogState = app.getDialogState();
        if (dialogState.state === STATES.START_GAME) {
            app.ask(app.buildInputPrompt(true,
                    `<speak>
                       <p>
                         <s>${rawInput} is not a valid choice.</s>
                         <s>Do you pick Rock, Paper, Scissors, Lizard or Spock</s>
                       </p>
                     </speak>`), dialogState);
        } else if (dialogState.state === STATES.INITIAL_STATE || dialogState.state === STATES.END_GAME) {
            const list = getStartList(app);
            app.askWithList(app.buildInputPrompt(true,
                    `<speak>
              <p>
                  <s>${rawInput} is not a valid choice.</s>
                  <s>If you need instructions, say Instructions.</s>
                  <s>To play the game, say Start Game</s>
              </p>
            </speak>`, ['Say Instructions or Start Game']), list, dialogState);
        } else {
            app.tell('Impossible choice, ending!');
        }
    }
}

module.exports = {
    mainIntentHandler: mainIntentHandler,
    optionIntentHandler: optionIntentHandler,
    textIntentHandler: textIntentHandler
};
