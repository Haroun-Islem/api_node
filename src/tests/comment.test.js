const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const controller = require("../controllers/commentController");

describe("Comment Controller", () => {
  // Se connecter à la base de données avant le début de tous les tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
  });

  // Se déconnecter de la base de données après la fin de tous les tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("listAllComments", () => {
    let post;
    let comments;

    // Ajouter une publication et des commentaires avant le début du test
    beforeEach(async () => {
      post = new Post({
        title: "Titre de publication",
        content: "Contenu de publication",
      });
      await post.save();

      comments = [
        new Comment({
          post_id: post._id,
          content: "Commentaire 1",
        }),
        new Comment({
          post_id: post._id,
          content: "Commentaire 2",
        }),
      ];
      await Comment.insertMany(comments);
    });

    // Supprimer la publication et les commentaires après la fin du test
    afterEach(async () => {
      await Post.findByIdAndRemove(post._id);
      await Comment.deleteMany();
    });

    test("devrait renvoyer tous les commentaires associés à une publication", async () => {
      const req = { params: { post_id: post._id } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.listAllComments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comments);
    });

    test("devrait renvoyer une erreur 500 en cas d'erreur serveur", async () => {
      const req = { params: { post_id: post._id } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      // Simuler une erreur serveur en renvoyant une erreur lors de la recherche de commentaires
      Comment.find = jest.fn((query, callback) => {
        callback(new Error("Erreur serveur"), null);
      });

      await controller.listAllComments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur." });
    });
  });
});
