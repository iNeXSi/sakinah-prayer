const DURATIONS=['15','30','60','full'];
function validateDuration(value){if(!DURATIONS.includes(value))throw Error('Invalid alert duration');return value;}
function durationMs(value,soundResult='playing'){
 if(soundResult!=='playing')return 15000;
 return value==='full'?360000:Number(validateDuration(value))*1000;
}
module.exports={DURATIONS,validateDuration,durationMs};
