JSJAC_HAVEKEYS = true;          // whether to use keys
JSJAC_NKEYS    = 16;            // number of keys to generate

JSJAC_INACTIVITY = 300;         // qnd hack to make suspend/resume
                                // work more smoothly with polling

JSJAC_ERR_COUNT = 10;           // number of retries in case of
                                // connection errors

JSJAC_ALLOW_PLAIN = true;       // whether to allow plaintext logins

JSJAC_ALLOW_SCRAM = false;      // allow usage of SCRAM-SHA-1
                                // authentication; please note that it
                                // is quite slow so it is disable by
                                // default

JSJAC_CHECKQUEUEINTERVAL = 100; // msecs to poll send queue
JSJAC_CHECKINQUEUEINTERVAL = 100; // msecs to poll incoming queue
JSJAC_TIMERVAL = 2000;          // default polling interval

JSJAC_RETRYDELAY = 5000;        // msecs to wait before trying next
                                // request after error

JSJAC_REGID_TIMEOUT = 20000;    // time in msec until registered
                                // callbacks for ids timeout

/* Options specific to HTTP Binding (BOSH) */
JSJACHBC_MAX_HOLD = 1;          // default for number of connctions
                                // held by connection manager

JSJACHBC_MAX_WAIT = 300;        // default 'wait' param - how long an
                                // idle connection should be held by
                                // connection manager

JSJACHBC_BOSH_VERSION  = "1.10";
JSJACHBC_USE_BOSH_VER  = true;

JSJACHBC_MAXPAUSE = 120;        // how long a suspend/resume cycle may
                                // take

/*** END CONFIG ***/
