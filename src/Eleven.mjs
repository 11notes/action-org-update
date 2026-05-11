import { inspect } from 'node:util';
import * as core from '@actions/core';
import * as _exec from '@actions/exec';

class Eleven{
  static #instance = null;
  static arguments = [];

  static #debug = false;
  static #config = {
    verbose:false,
  };

  static set(x, v){
    Eleven.#config[x] = v;
    Eleven.debug(`Eleven.set(${x}, ${v})`);
  }

  static get(x){
    return(Eleven.#config[x]);
  }

  static environment(e){
    switch(true){
      case /development|dev/ig.test(e):
        Eleven.#debug = true;
        Eleven.set('debug', true);
        break;
    }
  }

  static debug(){
    if(Eleven.#debug){
      core.info(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
    }
  }

  static info(){
    core.info(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
  }

  static warning(){
    core.warning(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
  }

  static error(){
    core.error(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
  }

  static fail(){
    core.setFailed(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
  }

  static notice(){
    core.notice(Eleven.#argumentsToPrintableString.apply(Eleven, arguments));
  }

  static exportVariable(n, v){
    core.exportVariable(n, `${v}`);
  }

  static getInput(v){
    return(core.getInput(v) || null);
  }

  static async exec(bin, arg=[], stripCRLF=true){
    let stdout = '';
    let stderr = '';

    const options = {
      listeners:{
        stdout:(data) => {
          stdout += data.toString();
        },
        stderr:(data) => {
          stderr += data.toString();
        }
      }
    };

    try{
      await _exec.exec(bin, arg, options);
    }catch(e){
      Eleven.warning(`exec [${bin}] exception: ${e}`);
      return(false);
    }
    if(stderr.length > 0){
      Eleven.warning(`exec [${bin}] exited with error: ${stderr}`);
      return(false);
    }
    if(stripCRLF){
      stdout = stdout.replace(/[\r\n]*/g, '');
    }
    return(stdout);
  }

  static getEleven(){
    if(!Eleven.#instance){
      Eleven.arguments = process.argv.slice(2);
      if(Array.isArray(Eleven.arguments) && Eleven.arguments.length > 0 && String(Eleven.arguments[0]).toLowerCase() === 'development'){
        Eleven.#debug = true;
        Eleven.set('debug', true);
      }
      Eleven.#instance = Eleven;
    }
    return(Eleven.#instance);
  }

  static #stdoutms(ms){
    switch(String(ms).length){
      case 0: return('000');
      case 1: return(`00${ms}`);
      case 2: return(`0${ms}`);
      default: return(ms);
    }
  }

  static #argumentsToPrintableString(){
    const a = [];
    const at = `${new Date().toLocaleString('de-CH', {timeZone:'Europe/Zurich'}).split(', ')[1]}.${Eleven.#stdoutms(new Date().getMilliseconds())}`;
    for(const i in arguments){
      a.push([
        at,
        (typeof(arguments[i]) === 'string' || typeof(arguments[i]) === 'number')
          ? arguments[i]
          : inspect(arguments[i]
        ,{showHidden:false, depth:null, colors:true}),
      ].join('   '));
    }
    return(a.join("\r\n"));
  }
}

export default Eleven.getEleven;