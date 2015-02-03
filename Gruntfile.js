'use strict';

module.exports = function (grunt) {
  /* load grunt plugins */
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: { src: 'Gruntfile.js' },
      core: { src: ['lib/**/*.js'] },
      test: { src: ['test/**/*.js'] },
      examples: { src: ['examples/**/*.js'] }
    },
    mochaTest: {
      test: {
        options: { reporter: 'spec' },
        src: ['test/**/*.js']
      }
    }
  });

  /* alias */
  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('default', ['test']);
};

