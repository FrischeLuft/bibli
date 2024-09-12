'use strict';

const gulp = require('gulp');
const webpack = require('webpack-stream');
const browsersync = require('browser-sync');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const postcss = require('gulp-postcss');

// const dist = "/Applications/MAMP/htdocs/test"; // Ссылка на вашу папку на локальном сервере
const dist = './dist';

//Кладет папку в dist, чтобы предоставлять доступ обслуживать при помощи сервера: 
gulp.task('copy-html', () => {
	return gulp
		.src('./src/index.html')
		.pipe(gulp.dest(dist))
		.pipe(browsersync.stream());
});

//Задача направлена, чтобы компилировать все стили написанные в sass:
gulp.task('build-sass', () => {
	return gulp
		.src('./src/sass/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(dist))
		.pipe(browsersync.stream());
});


gulp.task('build-js', () => {
	return gulp
		.src('./src/js/main.js')
		.pipe(
			webpack({
				mode: 'development',
				output: {
					filename: 'script.js',
				},
				watch: false,
				devtool: 'source-map',
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /(node_modules|bower_components)/,
							use: {
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												debug: true,
												corejs: 3,
												useBuiltIns: 'usage',
											},
										],
									],
								},
							},
						},
					],
				},
			})
		)
		.pipe(gulp.dest(dist))
		.on('end', browsersync.reload);
});

//Задача, чтобы запускать сервер на порт 4000
gulp.task('watch', () => {
	browsersync.init({
		server: './dist/',
		port: 4000,
		notify: true,
	});
	//Наблюдатель, который позволяет следить за изменениями:
	gulp.watch('./src/index.html', gulp.parallel('copy-html'));
	gulp.watch('./src/js/**/*.js', gulp.parallel('build-js'));
	gulp.watch('./src/sass/**/*.scss', gulp.parallel('build-sass'));
});

//Задача build => запускает все 3 задачи параллельно:
gulp.task('build', gulp.parallel('copy-html', 'build-js', 'build-sass'));

gulp.task('prod', () => {
	gulp
		.src('./src/sass/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([autoprefixer()]))
		.pipe(cleanCSS())
		.pipe(gulp.dest(dist));

	return gulp
		.src('./src/js/main.js')
		.pipe(
			webpack({
				mode: 'production',
				output: {
					filename: 'script.js',
				},
				module: {
					rules: [
						{
							test: /\.m?js$/,
							exclude: /(node_modules|bower_components)/,
							use: {
								loader: 'babel-loader',
								options: {
									presets: [
										[
											'@babel/preset-env',
											{
												corejs: 3,
												useBuiltIns: 'usage',
											},
										],
									],
								},
							},
						},
					],
				},
			})
		)
		.pipe(gulp.dest(dist));
});

//Запускает => паралельно 2 задачи:
gulp.task('default', gulp.parallel('watch', 'build'));
