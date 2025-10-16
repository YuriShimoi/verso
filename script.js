const guessLetters = document.querySelectorAll('.guess-letter');
const keyboardKeys = document.querySelectorAll('#keyboard .key');
let turnplayer = 1;
let focusedLetter = guessLetters[0];

function keyboardListener(event) {
  const validKeys = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];
  const keyPressed = event.key.toLowerCase();
  
  if (validKeys.includes(keyPressed) && focusedLetter) {
    focusedLetter.innerHTML = keyPressed.toUpperCase();

    guessLetters.forEach(agl => agl.removeAttribute('active'));
    let nextletter = Number(focusedLetter.dataset.letter) + 1;
    focusedLetter = document.getElementById(`p${turnplayer}l${nextletter}`);
    if(focusedLetter) focusedLetter.click();
  }
    
  if (event.key === 'Enter') {
    let guess = getWord();
    if(!guess.includes(' ')) {
      let valid = isValid(guess);
      if(valid) {
        let res = tryGuess(guess);
        applyGuess(res.result, valid);
        updateKeyboard(guess, res.result);
        if(res.correct) {
          let focusedPlayer = document.getElementById(`p${turnplayer}`);
          focusedPlayer.style.animation = 'winjump 0.6s infinite';
          document.removeEventListener('keydown', keyboardListener);
          document.querySelector('.guess-container[enabled]').classList.add('winning');
          document.getElementById('keyboard').classList.add('winning');
        }
        else {
          registerGuess(valid, res.result);
          changeTurn();
        }
      }
      else {
        shakePlayer(turnplayer);
      }
    }
    else {
      shakePlayer(turnplayer);
    }
  }

  if (event.key === 'Backspace') {
    let prev = Number(focusedLetter?.dataset.letter || 6) - 1;
    if(focusedLetter && focusedLetter.innerHTML !== '') prev = focusedLetter?.dataset.letter;
    if(prev > 0) {
      focusedLetter = document.getElementById(`p${turnplayer}l${prev}`);
      focusedLetter.innerHTML = '';
      focusedLetter.click();
    }
  }

  if (event.key === 'ArrowLeft') {
    let prev = Number(focusedLetter?.dataset.letter || 6) - 1;
    if(prev > 0) {
      document.getElementById(`p${turnplayer}l${prev}`).click();
    }
  }
    
  if (event.key === 'ArrowRight') {
    let next = Number(focusedLetter?.dataset.letter || 6) + 1;
    if(next < 6) {
      document.getElementById(`p${turnplayer}l${next}`).click();
    }
  }
};

document.addEventListener('keydown', keyboardListener);

guessLetters.forEach(gl => {
  gl.addEventListener('click', function(event) {
    focusedLetter = event.target;
    guessLetters.forEach(agl => agl.removeAttribute('active'));
    event.target.setAttribute('active', true);
  });
});

keyboardKeys.forEach(gl => {
  gl.addEventListener('click', function(event) {
    let key = event.target;
    let keyLetter = key.innerHTML.toLowerCase();
    if(keyLetter === 'enter') keyLetter = 'Enter';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: keyLetter }));
  });
});

function shakePlayer(player) {
  let focusedPlayer = document.getElementById(`p${player}`);
    focusedPlayer.style.animation = 'shake 0.4s';
    setTimeout(() => {
      focusedPlayer.style.animation = '';
    }, 400);
}

function applyGuess(results, validRes) {
  for(let r in results) {
    let letter = document.getElementById(`p${turnplayer}l${Number(r) + 1}`);
    letter.setAttribute('effect', results[r]);
    letter.innerHTML = validRes[r].toUpperCase();
  }
}

function updateKeyboard(letters, results) {
  for(let l in letters) {
    let key = document.getElementById(`key-${letters[l].toUpperCase()}`);
    if(key.getAttribute('effect') != '2') {
      key.setAttribute('effect', results[l]);
    }
  }
}

function registerGuess(guess, results) {
  let gres = document.createElement('DIV');
  gres.classList.add('guess-result');

  for(let l in guess) {
    let rletter = document.createElement('SPAN');
    rletter.classList.add('result-letter');
    rletter.setAttribute('effect', results[l]);
    rletter.innerHTML = guess[l].toUpperCase();

    gres.appendChild(rletter);
  }
  
  document.getElementById(`gl${turnplayer}`).appendChild(gres);
}

function changeTurn() {
  turnplayer = turnplayer == 1? 2: 1;
  guessLetters.forEach(gl => {
    if(gl.dataset.player == turnplayer) {
      gl.removeAttribute('effect');
      gl.innerHTML = '';
    }
  });

  document.getElementById(`p${turnplayer}l${1}`).click();
  document.querySelectorAll('.guess-container').forEach(gc => {
    gc.toggleAttribute('enabled');
  });
}

function getWord() {
  let word = '';

  guessLetters.forEach(gl => {
    if(gl.dataset.player == turnplayer) {
      word += gl.innerHTML || ' ';
    }
  });
  return word.toLowerCase();
}

function tryGuess(word) {
  results = [0, 0, 0, 0, 0];

  for(let l in word) {
    if(word[l] === simplified[l]) {
      results[l] = 2;
    }
    else if(simplified.includes(word[l])) {
      if(simplified.split('').some((lt, i) => lt == word[l] && lt != word[i])) {
        results[l] = 1;
      }
    }
  }

  return {
    correct: results.every(r => r === 2),
    result: results
  };
}

function isValid(word) {
  return WORDS.find(w => normalize(w).toLowerCase() == word.toLowerCase());
}

function normalize(word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c').toLowerCase();
}

let selected_word = WORDS[Math.round(Math.random() * WORDS.length)];
let simplified = normalize(selected_word);