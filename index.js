import getEleven from './src/Eleven.mjs';
import Action from './src/Action.mjs';
const Eleven = getEleven();

process
  .on('unhandledRejection', (reason, p) => {
    Eleven.warning('unhandledRejection', reason, p);
  })
  .on('uncaughtException', e => {
    Eleven.warning('uncaughtException', e);
  });

(async()=>{
  try{
    const action = new Action();
    await action.run();
  }catch(e){
    Eleven.error(e);
  }
})();