'use strict';

const ui = new UserInterface;
const vk = new Vkeys;
const panel = new Panel;
const name = new Names;
const alb_scrollbar = new Scrollbar;
const art_scrollbar = new Scrollbar;
const art_scroller = new Scrollbar;
const cov_scroller = new Scrollbar;
const but = new Buttons;
const popUpBox = new PopUpBox;
const txt = new Text;
const tag = new Tagger;
const resize = new ResizeHandler;
const lib = new Library;
const img = new Images;
const seeker = new Seeker;
const filmStrip = new FilmStrip;
const timer = new Timers;
const men = new MenuItems;
const server = new Server;
const infobox = new Infobox;

let lyrics;
if (panel.id.lyricsSource) lyrics = new Lyrics;

alb_scrollbar.type = 'alb';
art_scrollbar.type = 'art';
art_scroller.type = 'film';
cov_scroller.type = 'film';

timer.image();

timer.clear(timer.zSearch);
timer.zSearch.id = setTimeout(() => {
		if ($.server && ppt.panelActive) {
		server.download(false, {ix:0, focus:false}, {ix:0, focus:false}); server.download(false, {ix:0, focus:true}, {ix:0, focus:true});
		}
		timer.zSearch.id = null;
}, 3000);

//if (!ppt.get('Software Notice Checked', false)) fb.ShowPopupMessage('许可证\r\n\r\n版权所有 (c) 2021-2022 WilB\r\n\r\nThe above copyright notice shall be included in all copies or substantial portions of the Software.\r\n\r\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.', '简介');
//ppt.set('Software Notice Checked', true);