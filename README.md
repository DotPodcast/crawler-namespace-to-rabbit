## Namespace To Rabbit

This is one component of the scraping architecture. For an overview of
the entire crawler, see [dotpodcast-crawler](https://github.com/DotPodcast/dotpodcast-crawler)

Currently, this component:

1. Gets pages of names within a namespace
2. Publishes the list of names to RabbitMQ

Any name that returns an unexpected zonefile (one not starting with
`'$ORIGIN'`) is ignored.

### Setup
Install app dependencies with:
```
yarn
```

or
```
npm install
```

Then, make sure you have a RabbitMQ instance available:
```
docker-compose up
```
will do the trick. If you already have one running, ensure that the
rabbit host and exchange are configured properly in `config.json`.

Since multiple parts of this scraping system rely on RabbitMQ, I'd
recommend spinning one up and pointing all projects to it. The
`docker-compose.yml` with RabbitMQ and Elasticsearch we use to run the
crawler locally can be found in the [dotpodcast-crawler](https://github.com/DotPodcast/dotpodcast-crawler)
repository.

Run the app with:
```
yarn run dev
```
or
```
npm run dev
```
