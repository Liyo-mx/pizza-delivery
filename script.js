//DOM Elements
const orderSection= document.getElementById('orderSection');
const trackerSection= document.getElementById('trackerSection');
const placeOrderBtn=document.getElementById('placeOrderBtn');
const newOrderBtn= document.getElementById('newOrderBtn');
const pickedUpBtn=document.getElementById('pickedUpBtn');
const progressFill = document.getElementById('progressFill'); 
const estimatedTime = document.getElementById('estimatedTime');
 const currentStatus = document.getElementById('currentStatus');
  const orderNumber = document.getElementById('orderNumber');  
 const updateList = document.getElementById('updateList'); 
const notification = document.getElementById('notification'); 


//step elements
const steps=[
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4'),
    document.getElementById('step5')
];

//Timer variables
let countdownTimer;
let preparationTimer;
//randomly set delivery time between 15-20 minutes
let minutesLeft=Math.floor(Math.random() *6)+15;
let secondsLeft=0;
let currentStep=0;

//procress steps with timing
//in real app, these would be in minutes, but for demo purpose we use seconds
const processSteps=[
    {name:"Order Recieved", duration:60, progress:0},
    {name:"Preparing", duration:120, progress:20},
    {name:"In the Oven", duration:180, progress:40},
    {name:"Quality Check", duration:60, progress:60},
    {name:"Ready for Pickup", duration:0, progress:100},
];

//event listerns
placeOrderBtn.addEventListener('click', startDeliveryProcess);
newOrderBtn.addEventListener('click', resetProcess);
pickedUpBtn.addEventListener('click', markAsPickedUp);

//initialize order number
orderNumber.textContent="#" + generateOrderNumber();


function startDeliveryProcess(){
    //hide order sectionand show tracker
    orderSection.style.display='none';
    trackerSection.style.display='block';

    //show notification
    showNotification("Your order has been placed!");
    
    //add initial update
    addUpdate("Order Recieved",
    "Your order has been recieved and is being processed.");

    //start countdown timer
    startCountdown();

    //Start the preparation process
    startPreparation();

    //scroll to tracker section
    trackerSection.scrollIntoView({
        behavior:'smooth'
    });

}

function startCountdown(){
    //ADD log entry 
    addUpdate("Timer Started",
    "Countdown timer started using setInterval() to update every second.");

    //update timer display initially
    updateTimerDisplay();

    //set interval to update every seconf
    countdownTimer= setInterval(() =>{
        //decrease time
        if(secondsLeft ===0){
            if(minutesLeft ===0){
                //times up
                clearInterval(countdownTimer);
                //ensure timer shows 00:00
                estimatedTime.textContent="00:00";
                
                return;
            }
            minutesLeft--;
            secondsLeft=59;
        }else{
            secondsLeft--;
        }
        //update display
        updateTimerDisplay();
    }, 1000);

}

function updateTimerDisplay(){
    estimatedTime.textContent=`${minutesLeft.toString().padStart(2,'0')}:
                               ${secondsLeft.toString().padStart(2,'0')}`;
}

function startPreparation(){
    updateStepProgress(0);

    //function to process next step
    function processNextStep(){
    if(currentStep >= processSteps.length -1){
        //set timer
        minutesLeft=0;
        secondsLeft=0;
        updateTimerDisplay();
        showNotification("Your pizza is ready for pickup!");

        //shpw the picked up button
        pickedUpBtn.style.display= 'inline-block';
        return;
    }

    //move to next step
    currentStep++;

    //update progress and status
    updateStepProgress(currentStep);

    //set timeout
    const currentDuration=processSteps[currentStep].duration;

    if(currentStep< processSteps.length -1){
        //log the settimeout
        addUpdate("Timer Method",
        `Using setTimeout(${currentDuration * 1000}) to simulate
        "${processSteps[currentStep].name}" stage
        (${currentDuration/60} minutes in real life)`);

        preparationTimer= setTimeout(processNextStep, currentDuration * 1000);
    }else{
        //this is the last step
        //show the picked up button
        pickedUpBtn.style.display='inline-block';
    }
}
//log the settimeout usage for the firt transition
addUpdate("Timer Method",
`Using setTimeout(${processSteps[0].duration *1000}) to simulate
moving to "${processSteps[1].name}" stage
(${processSteps[0].duration/ 60} minutes in real life)`);

//set timeout for first step
preparationTimer=setTimeout(processNextStep, processSteps[0].duration *1000);

}

function updateStepProgress(stepIndex){
    //update the progress bar
    progressFill.style.width=`${processSteps[stepIndex].progress}%`;

    //update status text
    currentStatus.textContent= processSteps[stepIndex].name;

    //update step markers
    for(let i=0; i<= stepIndex; i++){
        steps[i].classList.add('completed');
        if(i < stepIndex){
            steps[i].classList.add('completed');
        }
    }
    addUpdate(
        processSteps[stepIndex].name,
        getStatusMessage(stepIndex)
    );
}

function getStatusMessage(stepIndex){
    const messages=[
        "We've recieved your order and it's been sent to the kitchen.",
        "Our chefs are preparing your pizza with fresh ingredients.",
        "Your pizza is now baking in out brick oven at 700℉.",
        "We're checking that your pizza meets our quality standards.",
        "Your pizza is ready! Please come to the counter to pick up your order"
    ];
    return messages[stepIndex];
}

function addUpdate(title, message){
    const now= new Date();
    const timeStr=now.toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit'
    });

    const updateItem= document.createElement('div');
    updateItem.className='update-item';

    //fill appropiate icon
    let icon='🕑';
    if(title==="Order Received") icon='📝';
    if(title ==="Preparing") icon='👨‍🍳';
    if(title=== "In the Oven") icon='🔥';
    if(title ==="Quality Check") icon='✅';
    if(title==="Ready for Pickup") icon='🔔';
    if(title==="Timer Method") icon='⌚';
    if(title==="Timer Started") icon='⏰';

    updateItem.innerHTML= `
        <div class="update-time">${timeStr}</div>
        <div class="update-icon">${icon}</div>
        <div class="update-text">
            <strong>${title}</strong><br>
            ${message}
            </div>
        `;
        updateList.prepend(updateItem);
}

function showNotification(message){
    notification.textContent= message;
    notification.classList.add('show');

    setTimeout(()=>{
        notification.classList.remove('show');
    },3000);
}

function resetProcess(){
    clearInterval(countdownTimer);
    clearTimeout(preparationTimer);

    //reset variables with fixed 15 min
    minutesLeft=15;
    secondsLeft=0;
    currentStep=0;

    //reset ui
    progressFill.style.width='0%';
    currentStatus.textContent='Order Received';

    //reset step marker
    steps.forEach(step =>{
        step.classList.remove('active');
        step.classList.remove('completed');
    });
    steps[0].classList.add('active');
    //clear update
    updateList.innerHTML='';

    //hide picked up button
    pickedUpBtn.style.display='none';

    //geneate new order number
    orderNumber.textContent="#"+ generateOrderNumber();

    //hide tracker
    trackerSection.style.display='none';
    orderSection.style.display='block';

    //scroll to top
    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}

function generateOrderNumber(){
    return Math.floor(10000+ Math.random()* 90000);
}

function markAsPickedUp(){
    addUpdate("Picked Up",
    "Pizza has been picked up the customer. Enjoy your meal!");

    //stop any reaming timer
    clearInterval(countdownTimer);
    clearTimeout(preparationTimer);

    //update display
    currentStatus.textContent="Picked Up";
    estimatedTime.textContent="00:00";

    //update progress display
    progressFill.style.width="100%";
    progressFill.style.backgroundColor="var(--accent-color)";

    //show notification
    showNotification("Thank you! Enjoy your pizza!");

    //disable the picked up button
    pickedUpBtn.disabled=true;
    pickedUpBtn.textContent="Picked Up";

    //log the timer
    addUpdate("Timer Method",
    "All timers stopped with clearInterval() and clearTimeOut()");
}