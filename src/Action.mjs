import getEleven from './Eleven.mjs';
import { readFileSync } from 'node:fs';

const Eleven = getEleven();

export default class Action{
  #etc = {
    json:'./.json',
  };

  inputs = {image:Eleven.getInput('image'), latest:Eleven.getInput('latest')};

  constructor(){
    Eleven.info('class Action initialized', this.inputs);
  }

  async run(){
    const current = this.#getCurrentVersion();
    if(!this.#checkIfLatestExistsAlready()){
      Eleven.warning(`latest version ${this.inputs.latest} exists already as a tag`);
    }else{
      if(current !== this.inputs.latest){
        Eleven.info(`latest version is ${this.inputs.latest}`);
        Eleven.exportVariable('ORG_UPDATE', true);
      }else{
        Eleven.warning(`latest version and current version are the same!`);
      }
    }
  }

  #getCurrentVersion(){
    try{
      const json = JSON.parse(readFileSync(this.#etc.json).toString());
      Eleven.info(`current version is ${json.semver.version}`);
      return(json.semver.version);
    }catch(e){
      throw new Error(`could not read/parse ${this.#etc.json}`);
    }
  }

  async #checkIfLatestExistsAlready(){
    const response = await fetch(`https://hub.docker.com/v2/repositories/${this.inputs.image}/tags/${this.inputs.latest}`);
    if(!response.ok){
      return(false);
    }
    return(true);
  }
}