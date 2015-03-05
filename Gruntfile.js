module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-loopback-sdk-angular');
  grunt.loadNpmTasks('grunt-docular');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    loopback_sdk_angular: {
      options: {
        input: './server/server.js',
        output: 'client/js/lb-services.js'
      }
    },
    docular: {
      groups: [{
        groupTitle: 'LoopBack',
        groupId: 'loopback',
        sections: [{
          id: 'lbServices',
          title: 'LoopBack Services',
          scripts: [ 'client/js/lb-services.js' ]
        }]
      }]
    }
  });

  grunt.registerTask('default', ['loopback_sdk_angular', 'docular']);
};
