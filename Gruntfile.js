/*
 * JSJaCJingle.js
 * Automated tasks (uses GruntJS)
 *
 * Copyright 2013, FrenchTouch Web Agency
 * Author: Valérian Saliou https://valeriansaliou.name/
 */


module.exports = function(grunt) {


  // Map tasks
  var GRUNT_TASKS_BUILD = {
    all: ['clean:reset', 'concat', 'copy', 'uglify', 'jsdoc', 'clean:temporary']
  };

  var GRUNT_TASKS_TEST = {
    all: ['build', 'lint']
  };

  var GRUNT_TASKS_LINT = {
    js: ['jshint']
  };


  // Map files
  var GRUNT_LIB_FILES = [
    'lib/underscore.js',
    'lib/ring.js'
  ];

  var GRUNT_SRC_FILES = [
    'src/jsjac.jingle.header.js',
    'src/jsjac.jingle.constants.js',
    'src/jsjac.jingle.utils.js',
    'src/jsjac.jingle.sdp.js',
    'src/jsjac.jingle.peer.js',
    'src/jsjac.jingle.base.js',
    'src/jsjac.jingle.single.js',
    'src/jsjac.jingle.muji.js',
    'src/jsjac.jingle.init.js',
    'src/jsjac.jingle.main.js'
  ];

  var GRUNT_CONCAT_FILES = GRUNT_LIB_FILES.concat(GRUNT_SRC_FILES);
  var GRUNT_LINT_FILES = GRUNT_SRC_FILES;


  // Map functions
  var fn_generate_banner = function(type) {
    return '/**\n' + 
           ' * <%= pkg.name %> [' + type + ']\n' + 
           ' * @fileoverview <%= pkg.description %>\n' + 
           ' *\n' + 
           ' * @version <%= pkg.version %>\n' + 
           ' * @date <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
           ' * @author <%= pkg.author.name %> <%= pkg.author.url %>\n' + 
           ' * @license <%= pkg.license %>\n' + 
           ' *\n' + 
           ' * @url <%= pkg.homepage %>\n' + 
           ' * @repository <%= pkg.repository.type %>+<%= pkg.repository.url %>\n' + 
           ' * @depends https://github.com/sstrigler/JSJaC\n' + 
           ' */\n\n';
  };


  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    // Task: Watch
    watch: {
      options: {
        interval: 500
      },

      javascripts: {
        files: 'src/**.js',
        tasks: GRUNT_TASKS_BUILD.all
      }
    },


    // Task: Clean
    clean: {
      temporary: ['tmp/'],
      reset: ['tmp/', 'build/*']
    },


    // Task: JSDoc
    jsdoc : {
      dist : {
        src: GRUNT_SRC_FILES,

        options: {
            destination: 'doc/'
        }
      }
    },


    // Task: JSHint
    jshint: {
      files: GRUNT_LINT_FILES
    },


    // Task: Concat
    concat: {
      options: {
        banner: fn_generate_banner('uncompressed')
      },

      all: {
        files: [{
          src: GRUNT_CONCAT_FILES,
          dest: 'tmp/jsjac.jingle.js',
        }]
      }
    },


    // Task: Copy
    copy: {
      all: {
        files: [{
          src: 'tmp/jsjac.jingle.js',
          dest: 'build/jsjac.jingle.js'
        }]
      }
    },


    // Task: Uglify
    uglify: {
      options: {
        report: 'min',
        banner: fn_generate_banner('compressed')
      },

      javascripts: {
        files: [{
          src: 'tmp/jsjac.jingle.js',
          dest: 'build/jsjac.jingle.min.js'
        }]
      }
    }
  });


  // Load plugins
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Register tasks
  grunt.registerTask('default', function() {
    return grunt.warn('Usage:' + '\n\n' + 'test - grunt test' + '\n\n');
  });

  grunt.registerTask('test', function() {
    for(t in GRUNT_TASKS_TEST) {
      for(i in GRUNT_TASKS_TEST[t]) {
        grunt.task.run(GRUNT_TASKS_TEST[t][i]);
      }
    }
  });

  grunt.registerTask('build', function() {
    for(t in GRUNT_TASKS_BUILD) {
      for(i in GRUNT_TASKS_BUILD[t]) {
        grunt.task.run(GRUNT_TASKS_BUILD[t][i]);
      }
    }
  });

  grunt.registerTask('lint', function(t) {
    var lint_t_all = [];

    if(t == null) {
      for(t in GRUNT_TASKS_LINT) {
        lint_t_all.push(t);
      }
    } else if(typeof GRUNT_TASKS_LINT[t] != 'object') {
      return grunt.warn('Invalid lint target name.\n');
    } else {
      lint_t_all.push(t);
    }

    for(c in lint_t_all) {
      t = lint_t_all[c];

      for(i in GRUNT_TASKS_LINT[t]) {
        grunt.task.run(GRUNT_TASKS_LINT[t][i]);
      }
    }
  });

};