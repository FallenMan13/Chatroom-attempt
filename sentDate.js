module.exports.createdOn = function createdOn(){ //Timestamp for created summary data in the format 'yyyy-mm-ddThh:hh:mm:ss.mmmZ'
  var date = new Date();
  var df = ('0' + String(date.getHours())).substr(-2) + ":"
            + ('0' + String(date.getMinutes())).substr(-2) + ":"
            + ('0' + String(date.getSeconds())).substr(-2)
  return df.toString();
}
