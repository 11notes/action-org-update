import getEleven from './Eleven.mjs';
import { readFileSync } from 'node:fs';
import Buffer from 'node:buffer';

const Eleven = getEleven();

export default class Action{
  #etc = {
    json:'./.json',
  };
  #json = {};

  inputs = {image:Eleven.getInput('image'), latest:Eleven.getInput('latest')};

  constructor(){
    Eleven.info('class Action initialized', this.inputs);
  }

  async run(){
    const current = this.#getCurrentVersion();
    Eleven.info(`latest version is: ${this.inputs.latest}`);
    if(this.#latestTagExists()){
      Eleven.warning(`latest version ${this.inputs.latest} exists already as a tag`);
    }else{
      if(current !== this.inputs.latest){
        Eleven.info(`latest version does not exist as a tag yet`);
        Eleven.exportVariable('ORG_UPDATE', true);
        Eleven.exportVariable('ORG_UPDATE_BASE64JSON', Buffer.from(JSON.stringify({
          version:this.inputs.latest,
          tag:await Eleven.exec('git', ['describe', '--abbrev=0', '--tags', await Eleven.exec('git', ['rev-list', '--tags', '--max-count=1'])]).replace('v', ''),
          unraid:this.#json?.unraid || false,
          nobody:this.#json?.nobody || false,
        })).toString('base64'));
      }else{
        Eleven.warning(`latest version and current version are the same!`);
      }
    }
  }

  #getCurrentVersion(){
    try{
      this.#json = JSON.parse(readFileSync(this.#etc.json).toString());
      Eleven.info(`current version is: ${this.#json.semver.version}`);
      return(this.#json.semver.version);
    }catch(e){
      throw new Error(`could not read/parse ${this.#etc.json}`);
    }
  }

  async #latestTagExists(){
    const response = await fetch(`https://hub.docker.com/v2/repositories/${this.inputs.image}/tags/${this.inputs.latest}`);
    Eleven.info(`checking if latest version (${this.inputs.latest}) exists as a tag: ${response.ok}`);
    return(response.ok);
  }
}