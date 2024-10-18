
/**
 * @swagger
 * components:
 *      schemas:
 *          Data_post:
 *              type: object
 *              properties:
 *                  temp1:
 *                      type: number
 *                  voltage1:
 *                      type: number 
 *                  temp2:
 *                      type: number
 *                  voltage2: 
 *                      type: number
 * 
 */

/**
 * @swagger
 * tags:
 *      name: DATA
 *      description: Action that must be perform before accessing the resources
 */

/**
 * @swagger
 * /postData:
 *      post:
 *          summary: Log Data
 *          description: Store data
 *          tags: [DATA]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              temp1:
 *                                  type: number
 *                              voltage1:
 *                                  type: number 
 *                              temp2:
 *                                  type: number
 *                              voltage2: 
 *                                  type: number
 *          responses:
 *              200:
 *                  description: Successful login / Unsuccessful login
 *                      
 */
