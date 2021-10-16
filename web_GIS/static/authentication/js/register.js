let timerOn = true;

function timer(remaining) {
  var m = Math.floor(remaining / 60);
  var s = remaining % 60;
  
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  document.getElementById('timer').innerHTML = m + ':' + s;
  remaining -= 1;
  
  if(remaining >= 0 && timerOn) {
    setTimeout(function() {
        timer(remaining);
    }, 1000);
    return;
  }

  if(!timerOn) {
    // Do validate stuff here
    return;
  }
  
  // Do timeout stuff here
  alert('Timeout for otp');
}



// --------------------------------



console.clear()

const otpBtn = document.getElementById('otp')
const loginBtn = document.getElementById('login')
const registerBtn = document.getElementById('register')
var timer_start = false;
registerBtn.addEventListener('click', (e) => {
otpBtn.click();
})
otpBtn.addEventListener('click', (e) => {
  let parent = e.target.parentNode.parentNode
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      parent.classList.add('slide-up')
      loginBtn.parentNode.classList.remove('slide-up')
      
      
    } else {

      loginBtn.parentNode.classList.add('slide-up')
      parent.classList.remove('slide-up')

      let input = document.getElementById('otc-1');
      input.focus();
      input.select();

      if (timer_start===false){
        timer(120);
      }
    }
  })
})

loginBtn.addEventListener('click', (e) => {
  let parent = e.target.parentNode
  Array.from(e.target.parentNode.classList).find((element) => {
    if (element !== 'slide-up') {
      // parent.classList.add('slide-up')
    } else {
      timer_start=true;
      otpBtn.parentNode.parentNode.classList.add('slide-up')
      parent.classList.remove('slide-up')
    }
  })
})

// ------------------

let in1 = document.getElementById('otc-1'),
  ins = document.querySelectorAll('input[type="number"]')

ins.forEach(function (input) {
  /**
   * Control on keyup to catch what the user intent to do.
   * I could have check for numeric key only here, but I didn't.
   */
  input.addEventListener('keyup', function (e) {
    // Break if Shift, Tab, CMD, Option, Control.
    if (
      e.keyCode === 16 ||
      e.keyCode == 9 ||
      e.keyCode == 224 ||
      e.keyCode == 18 ||
      e.keyCode == 17
    ) {
      return
    }

    // On Backspace or left arrow, go to the previous field.
    if (
      (e.keyCode === 8 || e.keyCode === 37) &&
      this.previousElementSibling &&
      this.previousElementSibling.tagName === 'INPUT'
    ) {
      this.previousElementSibling.select()
    } else if (e.keyCode !== 8 && this.nextElementSibling) {
      this.nextElementSibling.select()
    }
  })

  /**
   * Better control on Focus
   * - don't allow focus on other field if the first one is empty
   * - don't allow focus on field if the previous one if empty (debatable)
   * - get the focus on the first empty field
   */
  input.addEventListener('focus', function (e) {
    // If the focus element is the first one, do nothing
    if (this === in1) return

    // If value of input 1 is empty, focus it.
    if (in1.value == '') {
      in1.focus()
    }

    // If value of a previous input is empty, focus it.
    // To remove if you don't wanna force user respecting the fields order.
    if (this.previousElementSibling.value == '') {
      this.previousElementSibling.focus()
    }
  })
})

/**
 * Handle copy/paste of a big number.
 * It catches the value pasted on the first field and spread it into the inputs.
 */
in1.addEventListener('input', function (e) {
  let data = e.data || this.value // Chrome doesn't get the e.data, it's always empty, fallback to value then.
  if (!data) return // Shouldn't happen, just in case.
  if (data.length === 1) return // Here is a normal behavior, not a paste action.

  for (i = 0; i < data.length; i++) {
    ins[i].value = data[i]
  }
})
