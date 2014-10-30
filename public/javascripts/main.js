$(function() {
  window.URL = window.URL || window.webkitURL;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.requestAnimationFrame =    
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame

  var video = document.getElementById('campreview');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var images = [];
  var capture;
  var startTime;
  var frameTime = 0;
  var width;
  var height;


  var onFailSoHard = function(e) {
    //console.log('Rejected!',e);
  };

    if (navigator.getUserMedia) {
    navigator.getUserMedia({
      audio:false,
      video:true
    },function(stream) {
      video.src = window.URL.createObjectURL(stream);
    },onFailSoHard);
    } else {

    }

  /**
  * Capture the next frame of the video.
  */
  function Frame() {
    width = video.clientWidth;
    height = video.clientHeight;
    canvas.width = width;
    canvas.height = height;
    if (frameTime < 50) {
      frameTime++;
      var imageData;
      ctx.drawImage(video,0,0,width,height);
      imageData = ctx.getImageData(0,0,width,height);
      images.push({duration:new Date().getTime() - startTime,datas:imageData});
      startTime = new Date().getTime();
      requestAnimationFrame(Frame);
    } else {
      requestAnimationFrame(function (){
            var capture = new Whammy.Video();
            encodeVideo(capture,0);

      });
      frameTime=0;
    }
  }
  /*
  * Encode the captured frames.
  */
  function encodeVideo(capture,currentImage) {
    if(currentImage < images.length) {
      ctx.putImageData(images[currentImage].datas,0,0);
      capture.add(ctx,images[currentImage].duration);
      delete images[currentImage];
      //progress.value = currentImage;
      currentImage++;
      setTimeout(function() {
      encodeVideo(capture,currentImage);
      },5);
    } else {
      var output = capture.compile();
      //setMessage('Finished');
      images = [];
      //enableStartButton(true)
      sendMessage(output);
    }
  }









  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  //var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  //var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  //var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
 /* function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }*/

  // Sends a chat message
  $currentInput = $inputMessage.focus();
  
  function sendMessage (output) {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);

    // tell server to execute 'new message' and send along one parameter
    socket.emit('new message', {message:message,video:output});

    //capture video and message text
    
    // if there is a non-empty message and a socket connection
     //$inputMessage.val('');
      //addChatMessage({
      //  username: username,
      //  video: output,
      //  message: message
      // });

    var unixtimestamp = Math.round(new Date().getTime()/1000);
    var unixtime = new Date(unixtimestamp*1000);
    // Don't fade the message in if there is an 'X was typing'
    //var $typingMessages = getTypingMessages(data);
    //options = options || {};
    //if ($typingMessages.length !== 0) {
    //  options.fade = false;
    //  $typingMessages.remove();
    //}

    var $usernameDiv = $('<span class="username"/>')
      .text(username)
      .css('color', getUsernameColor(username));

    // video display
    var $captureVideoDiv = $('<video class="videoCapture" width="240px" height="150px" autoplay="true" loop/>')
        .attr('src',window.URL.createObjectURL(output));

    var $messageBodyDiv = $('<span class="messageBody"/>')
      .text(message);

    var $timeDiv = $('<time class="messageTime"/>')
      .text(unixtime.toLocaleTimeString())
      .css('margin-left',50);


    //var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', username)
      .append([$captureVideoDiv,$messageBodyDiv,$usernameDiv,$timeDiv]);

    addMessageElement($messageDiv);
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // unix timestamp
    var unixtimestamp = Math.round(new Date().getTime()/1000);
    var unixtime = new Date(unixtimestamp*1000);
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));

    // video display
    var $captureVideoDiv = $('<video class="videoCapture" width="240px" height="150px" autoplay="true" loop/>')
        .attr('src',data.video);

    var $messageBodyDiv = $('<span class="messageBody"/>')
      .text(data.message);

    var $timeDiv = $('<time class="messageTime"/>')
      .text(unixtime.toLocaleTimeString())
      .css('margin-left',50);


    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append([$captureVideoDiv,$messageBodyDiv,$usernameDiv,$timeDiv]);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        Frame();
        socket.emit('stop typing');
        typing = false;
      } else {
        //setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
 // $loginPage.click(function () {
  //  $currentInput.focus();
  //});

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
});
