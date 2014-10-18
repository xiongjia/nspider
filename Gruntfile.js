'use strict';

module.exports = function (grunt) {
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

  /* load plugins */
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  /* alias */
  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('default', ['test']);
};

