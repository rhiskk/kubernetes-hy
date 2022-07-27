# Exercise 3.06: DBaaS vs DIY

## DBAAS:

### Pros:

- Easier to initialize and maintain
- Likely cheaper in small projects
- Allows developers to focus on development rather than initializing and maintaining the database
- Easy to use automated backups

### Cons:

- Need to rely on a third party service
- Might become very expensive as the project scales and swtching to a different solution might be a pain at that point

<br/>

## DIY:

### Pros:

- Can be customized precisely to your needs
- Might be cheaper with larger amounts of data

### Cons:

- More complex to initialize and maintain
- In smaller projects with less data, initializing and maintaining costs can be higher than DBaaS costs
- Backups are harder to set up and use

<br/>

# Exercise 3.07: Commitment

I will use PersistentVolumeClaims in this project, since I am already using them and don't really have time to look into Google Cloud SQL at this point.
