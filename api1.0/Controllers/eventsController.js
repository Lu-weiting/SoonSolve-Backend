const eventsModel = require('../Models/eventsModel');
const tool = require('../utils/tool')
const errorMsg = require('../utils/error');


module.exports = {
  getEvent: async (req, res) => {
    try{
      const my_id = req.decoded.id;

      const notification = await eventsModel.getEvent(my_id, res);
      
      const notification_result = notification.map((notification) => {
        let summary = '';
        if (notification.type === 'friend_request') {
          summary = `${notification.name} invited you to be friends.`;
        } 
        else if(notification.type === 'friend_reqAccept'){
          summary = `${notification.name} has accepted your friend request.`;
        }
        else if(notification.type === 'task_request'){
          summary = `${notification.name} would like to take on your task.`;
        }
        else if(notification.type === 'task_reqAccept'){
          summary = `${notification.name} has accepted your task application.`;
        }
        else if(notification.type === 'comment'){
          summary = `${notification.name} has left a comment for you.`;
        }
        return {
          id: notification.events_id,
          type: notification.type,
          is_read: Boolean(notification.is_read),
          image: notification.picture,
          created_at: notification.formatted_created_at,
          summary: summary
        };
      });
      const response = {
        "data": {
          "events": notification_result
        }
      };
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
  readEvent: async (req, res) => {
    try{
      const event_id = req.params.event_id;
      
      const event = await eventsModel.readEvent(event_id)
      const response = {
        "data": {
          "event": {
            "id": event_id
          }
        }
      }
      return res.json(response);
    }
    catch(error){
      errorMsg.controllerProblem(res);
      console.error(error);
    }
  },
}
