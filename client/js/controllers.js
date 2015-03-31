/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {
    this.userName = 'Example user';
    this.helloText = 'Bienvenidos a la visualización de victimas del conflicto armado en Colombia';
  this.descriptionShort= 'Las víctimas en enfoque.';
  this.descriptionLong1= 'La visualización pretende hacer visible los hechos ocurridos y documentados de forma neutral, ';
  this.descriptionLong2= 'con el fin de apoyar las víctimas, y por fin de fomentar y lograr la paz en el país.';

};


angular
    .module('victimas')
    .controller('MainCtrl', MainCtrl)
