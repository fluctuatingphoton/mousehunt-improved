import { getFlag } from '../utils';
import trollMode from './modules/troll-mode';
import rankupForecaster from './modules/rank-up-forecaster';

const fillTwttrObject = () => {
  window.twttr = {
    widgets: {
      load: () => {},
      createShareButton: () => {},
    },
  };

  class SocialLink {
    constructor(url) {
      this.url = url;
    }
    appendTo() {}
    setFacebookLikeUrl() {}
    setFacebookShareUrl() {}
    setImage() {}
    setTitle() {}
    setTwitterUrl() {}
  }

  hg.classes.SocialLink = SocialLink;
};

export default () => {
  if (getFlag('lol-gottem')) {
    trollMode();
  }

  if (getFlag('twitter')) {
    fillTwttrObject();
  }

  if (! getFlag('rankup-forecaster')) {
    rankupForecaster();
  }
};
