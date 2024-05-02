import { postSong, bulkPost } from './lib/index.js'

document.getElementById("postSongButton").addEventListener('click', postSong ) ;
document.getElementById("uploadBulk").addEventListener('click', bulkPost);