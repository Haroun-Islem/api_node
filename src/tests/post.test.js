const request = require("supertest");
const app = require("../app");
const Post = require("../models/postModel");

describe("Test de la route des articles de blog", () => {
  let post_id;

  beforeEach(async () => {
    // Crée un nouvel article pour chaque test
    const post = new Post({
      title: "Mon premier article",
      content: "Ceci est le contenu de mon premier article.",
    });
    await post.save();
    post_id = post._id;
  });

  afterEach(async () => {
    // Supprime tous les articles après chaque test
    await Post.deleteMany();
  });

  it("devrait récupérer tous les articles", async () => {
    const response = await request(app).get("/posts");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Mon premier article");
  });

  it("devrait créer un nouvel article", async () => {
    const response = await request(app)
      .post("/posts")
      .send({
        title: "Nouvel article",
        content: "Ceci est un nouvel article.",
      });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Nouvel article");
  });

  it("devrait récupérer un article spécifique", async () => {
    const response = await request(app).get(`/posts/${post_id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Mon premier article");
  });

  it("devrait mettre à jour un article", async () => {
    const response = await request(app)
      .put(`/posts/${post_id}`)
      .send({ title: "Article mis à jour" });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Article mis à jour");
  });

  it("devrait supprimer un article", async () => {
    const response = await request(app).delete(`/posts/${post_id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Article supprimé");
  });
});
