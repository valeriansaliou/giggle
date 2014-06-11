/*
 * JSJaCJingle.js
 * Automated tasks (uses GruntJS)
 *
 * Copyright 2013, FrenchTouch Web Agency
 * Author: Valérian Saliou https://valeriansaliou.name/
 */


module.exports = function(grunt) {

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
        tasks: ['clean:reset', 'concat', 'uglify']
      }
    },


    // Task: Clean
    clean: {
      reset: ['build/*']
    },


    // Task: JSHint
    jshint: {
      files: ['./build/jsjac.jingle.js']
    },


    // Task: Concat
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
      },

      all: {
        files: {
          src: 'src/**.js',
          dest: 'build/jsjac.jingle.js'
        }
      }
    },


    // Task: Copy
    copy: {
      all: {
        files: {
          src: 'tmp/jsjac.jingle.js',
          dest: 'build/jsjac.jingle.js'
        }
      }
    },


    // Task: Uglify
    uglify: {
      options: {
        report: 'min',
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
      },

      javascripts: {
        files: {
          src: 'tmp/jsjac.jingle.js',
          dest: 'build/jsjac.jingle.min.js'
        }
      }
    }
  });


  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  // Map tasks
  var GRUNT_TASKS_BUILD = {
    all: [['concat',0], ['uglify',0]]
  };

  var GRUNT_TASKS_TEST = {
    all: [['lint',0]]
  };

  var GRUNT_TASKS_LINT = {
    js: [['jshint',0]]
  };


  // Register tasks
  grunt.registerTask('default', function() {
    return grunt.warn('Usage:' + '\n\n' + 'test - grunt test' + '\n\n');
  });

  grunt.registerTask('test', function() {
    for(t in GRUNT_TASKS_TEST) {
      for(i in GRUNT_TASKS_TEST[t]) {
        grunt.task.run(GRUNT_TASKS_TEST[t][i][0] + (GRUNT_TASKS_TEST[t][i][1] ? (':' + t) : ''));
      }
    }
  });

  grunt.registerTask('build', function(t) {
    // Force target to 'all'
    t = 'all';

    for(i in GRUNT_TASKS_BUILD[t]) {
      grunt.task.run(GRUNT_TASKS_BUILD[t][i][0] + (GRUNT_TASKS_BUILD[t][i][1] ? (':' + t) : ''));
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
        grunt.task.run(GRUNT_TASKS_LINT[t][i][0] + (GRUNT_TASKS_LINT[t][i][1] ? (':' + t) : ''));
      }
    }
  });

  grunt.registerTask('rebuild', function() {
    grunt.task.run('clean:reset');
    grunt.task.run('build');
  });

};