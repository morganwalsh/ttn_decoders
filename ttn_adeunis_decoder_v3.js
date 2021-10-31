/*******************************************************************************
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT 
HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER 
LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
********************************************************************************/

/*
 * Adeunis Field Tracker - Partial TTN Decoder
 * Written by Gary Howell (c) 2021
 * Version 1.0 - Initial version - partial decoder for TTN Mapper
 */

 function bcdtonumber(bytes) {
    var num = 0;
    var m = 1;
    var i;

    for (i = 0; i < bytes.length; i++) {
        num += (bytes[bytes.length - 1 - i] & 0x0F) * m;
        num += ((bytes[bytes.length - 1 - i] >> 4) & 0x0F) * m * 10;
        m *= 100;
    }
    return num;
}

function decodeUplink(input) {
    const port = 1; // input.port;
    const bytes = input.bytes;

    if (port === 1) {
        let lat = 0;
        let lng = 0;
        let sats = 0;
        let hdop = 0;

        //Process Payload
        const state = bytes[0];

        if (state & (1 << 4)) {
            var deg = bcdtonumber([bytes[2]]);
            var min = bcdtonumber([bytes[3]]);
            var sec_dec = bcdtonumber([bytes[4], (bytes[5] & 0xF0)]);
            var min_sec = ((sec_dec / 10000) + min);
            lat = deg + (min_sec / 60);
            lat *= (bytes[5] & 0x1) ? -1 : 1; // South or North

            // Get Long
            deg = bcdtonumber([bytes[6]]) * 10;
            deg += (bcdtonumber([bytes[7] & 0xF0]) / 10);
            min = (bcdtonumber([bytes[7] & 0x0F]) * 10);
            min += (bcdtonumber([bytes[8] & 0xF0]) / 10);
            sec_dec = (bcdtonumber([bytes[8] & 0x0F]) * 10);
            sec_dec += (bcdtonumber([bytes[9] & 0xF0]) / 10);
            min_sec = ((sec_dec / 100) + min);
            lng = deg + (min_sec / 60);
            lng *= (bytes[9] & 0x1) ? -1 : 1; // West or East

            hdop = (bytes[10] & 0xF0) >> 4;  
            sats = (bytes[10] & 0x0F);
        }

        return {
            data: {
                latitude: lat,
                longitude: lng,
                sats: sats,
                hdop: hdop
            },
            warnings: [],
            errors: []
        };

    } // if port === 1
} // decodeUpLink
