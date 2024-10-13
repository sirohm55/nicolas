
/**
 * @swagger
 * components:
 *      schemas:
 *          visitor_display:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  username:
 *                      type: string
 *                  email:
 *                      type: string
 *                  role:
 *                      type: string
 * 
 */

/**
 * @swagger
 * components:
 *      schemas:
 *          db_display:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  ic:
 *                      type: string
 *                  username:
 *                      type: string
 *                  password:
 *                      type: string
 *                  email:
 *                      type: string
 *                  role:
 *                      type: string
 * 
 */

/**
 * @swagger
 * components:
 *      schemas:
 *          appointment:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                  name:
 *                      type: string
 *               
 * 
 */

/**
 * @swagger
 * tags:
 *      name: Login_or_Logout
 *      description: Action that must be perform before accessing the resources
 */

/**
 * @swagger
 * tags:
 *      name: Visitor
 *      description: API for visitor
 */

/**
 * @swagger
 * tags:
 *      name: Host
 *      description: API for host (user)
 */

/**
 * @swagger
 * tags:
 *      name: Security
 *      description: API for security 
 */

/**
 * @swagger
 * tags:
 *      name: Admin
 *      description: API for Admin (administrator)
 */

/**
 * @swagger
 * /login:
 *      post:
 *          summary: user login
 *          description: User Login
 *          tags: [Login_or_Logout]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              username:
 *                                  type: string
 *                              password:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Successful login / Unsuccessful login
 *                      
 */

/**
* @swagger
* /user/test/create:
*      post:
*          summary: Host registration test
*          description: User Register test
*          tags: [Host]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               ic:
*                                   type: string 
*                               username:
*                                   type: string
*                               password:
*                                   type: string
*                               email:
*                                   type: string
*                               unit_number:
*                                   type: string
*                               contact_number:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: register is successful/ unsuccessful
*/

/**
* @swagger
* /register:
*      post:
*          summary: Host registration
*          description: User Register
*          tags: [Host]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               ic:
*                                   type: string 
*                               username:
*                                   type: string
*                               password:
*                                   type: string
*                               email:
*                                   type: string
*                               unit_number:
*                                   type: string
*                               contact_number:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: register is waiting for approval / rejected 
*/

/**
* @swagger
* /login/user/add_visitor:
*      post:
*          summary: Add visitor
*          description: Add visitor
*          tags: [Host]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               ic:
*                                   type: string 
*                               username:
*                                   type: string
*                               email:
*                                   type: string
*                               contact_number:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: visitor is added successfully/ unsuccessfully 
*/

/**
 * @swagger
 * /login/user/visitor_display:
 *      get:
 *          summary: All register visitors display
 *          tags: [Host]
 *          responses:
 *              '200':
 *                  describe:  list of visitors
 */

/**
* @swagger
* /login/user/delete_visitor:
*      delete:
*          summary: Visitor delete 
*          description: Visitor Delete
*          tags: [Host]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               id:
*                                   type: string
*                               username:
*                                   type: string
*                               email:
*                                    type: string
*                                
*          responses:
*              200:
*                  description: Visitor deleted successfully/ unsuccessfully 
*/

/**
 * @swagger
 * /login/user/display_issue_users:
 *      get:
 *          summary: display all pass issued to visitor 
 *          tags: [Host]
 *          responses:
 *              '200':
 *                  describe:  list of visitors pass
 */

/**
 * @swagger
 * /login/user/issue:
 *      post:
 *          summary: Issue pass for visitor
 *          description: Issue pass for visitor
 *          tags: [Host]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              visitor_id:
 *                                  type: string
 *                              date:
 *                                  type: string
 *                              time:
 *                                  type: string
 *                            
 *          responses:
 *              200:
 *                  description: Successful issue / Unsuccessful issue
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/appointment'  
 */

/**
 * @swagger
 * /login/user/delete_pass:
 *      delete:
 *          summary: Remove issued pass for visitor
 *          description: Remove issued pass for visitor
 *          tags: [Host]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              visitor_id:
 *                                  type: string
 *                            
 *          responses:
 *              200:
 *                  description: Successful remove / Unsuccessful remove pass
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/appointment'  
 */

/**
 * @swagger
 * /login/visitor/pass:
 *      post:
 *          summary: Retrieve visitor pass
 *          description: Retrieve visitor pass
 *          tags: [Visitor]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              host_id:
 *                                  type: string
 *                              visitor_id:
 *                                  type: string
 *                            
 *          responses:
 *              200:
 *                  description: Successful retrieve / Unsuccessful retrieve
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/appointment'
 *     
 */

/**
 * @swagger
 * /login/security/registration_display:
 *      get:
 *          summary: All pass from host
 *          tags: [Security]
 *          responses:
 *              '200':
 *                  describe:  list of host registration list
 */

/**
* @swagger
* /login/security/registration_approval:
*      post:
*          summary: Host registration approval
*          description: Host registration approval
*          tags: [Security]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               registration_id:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: register successfully/ register unsuccessful 
*/

/**
* @swagger
* /login/security/registration_rejection:
*      post:
*          summary: Host registration rejection
*          description: Host registration rejection
*          tags: [Security]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               rejection_id:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: register rejected successfully/ unsuccessful
*/

/**
 * @swagger
 * /login/security/pass_display:
 *      get:
 *          summary: list of visitor pass waiting for verification
 *          tags: [Security]
 *          responses:
 *              '200':
 *                  describe:  list visitor pass waiting for verification
 */

/**
* @swagger
* /login/security/verify_pass:
*      post:
*          summary: visitor pass verification
*          description: visitor pass verification
*          tags: [Security]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               reference_id:
*                                   type: string
*                                
*          responses:
*              200:
*                  description: visitor pass verified successfully/ unsuccessfully
*/

/**
 * @swagger
 * /login/security/host_display:
 *      get:
 *          summary: All registered hosts display
 *          tags: [Security]
 *          responses:
 *              '200':
 *                  describe:  list of hosts
 */

/**
* @swagger
* /login/security/delete_host:
*      delete:
*          summary: Host delete 
*          description: Host Delete
*          tags: [Security]
*          requestBody:
*              required: true
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                          properties:
*                               id:
*                                   type: string
*                               username:
*                                   type: string
*                               email:
*                                    type: string
*                                
*          responses:
*              200:
*                  description: Host deleted successfully/ unsuccessfully 
*/

/**
 * @swagger
 * /login/admin_login:
 *      post:
 *          summary: user login
 *          description: User Login
 *          tags: [Admin]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              username:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                              secret:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Successful login / Unsuccessful login
 *                      
 */

/**
 * @swagger
 * /login/admin/change_to_security:
 *      post:
 *          summary: Change host to security
 *          description: Change host to security
 *          tags: [Admin]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              host_id:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Successful/ Unsuccessful to become security
 *                      
 */

/**
 * @swagger
 * /login/admin/change_to_host:
 *      post:
 *          summary: Change security to host
 *          description: Change security to host
 *          tags: [Admin]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              security_id:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Successful/ Unsuccessful to become host
 *                      
 */

/**
 * @swagger
 * /login/admin/access:
 *      get:
 *          summary: All register visitors & users display
 *          tags: [Admin]
 *          responses:
 *              '200':
 *                  describe:  list of visitors & users
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#components/schemas/db_display'
 *          
 * 
 */



/**
 * @swagger
 * /login/logout:
 *      get:    
 *          summary: logout  
 *          tags: [Login_or_Logout] 
 *          responses:
 *              200: 
 *                  description: logout success
 */