/**
 * This is exposed via API.
 */
namespace Public {
	/**
	 * The editor get a link and execute GET request.
	 * This is what it gets back.
	 */
	export interface Project {
		/**
		 * Version identifier so we can support different version in the future.
		 */
		version: "v1";

		/**
		 * Uniq identifier.
		 */
		identifier: string;

		/**
		 * Name of the project.
		 */
		label: string;

		api: {
			/**
			 * Where to read the comments from.
			 */
			read: ApiAccess;

			/**
			 * Where to submit the comments to.
			 * When undefined the user should see content as read only.
			 */
			write: ApiAccess | undefined;
		};
	}

	export interface ApiAccess {
		/**
		 * URL with the query part.
		 */
		url: string;

		/**
		 * Headers to send with the request.
		 */
		headers: Record<string, string>;
	}

	/**
	 * This is what application gets from {@link Configuration::api::read}.
	 */
	export interface ReadApiResponse {
		/**
		 * Relevant repositories.
		 * This defined the content visible to the user.
		 */
		repositories: Repository[];

		/**
		 * This is the main content.
		 */
		comments: Comment[];
	}

	/**
	 * This is just a base interface, we specialize it to provide
	 * information about the repository.
	 */
	export interface Repository {
		type: string;

		identifier: string;
	}

	/**
	 * This may be the only one to implement.
	 */
	export interface GitRepository extends Repository {
		type: "git";

		/**
		 * Repository URL.
		 * @example https://github.com/skodapetr/autodock-vina
		 */
		url: string;

		/**
		 * SHA of the relevant commit.
		 */
		commit: string;

		/**
		 * A bearer token should it be needed.
		 */
		token: string | undefined;
	}

	export interface Comment {
		identifier: string;

		/**
		 * Identifier of a repository this comment belongs to.
		 * We have it here and not in the {@link location} to keep
		 * it easily accessible.
		 */
		repository: string;

		/**
		 * To what is this comment relevant to.
		 */
		location: Location;

		/**
		 * The main comment in markdown.
		 */
		content: string;

		/**
		 * We use tags to provide additional information, like
		 * who is the author or whether this comment is a suggestion.
		 *
		 * TODO: Alternative would be to move this functionality to
		 *  separate field, which may be actually better.
		 */
		tags: Tag[];
	}

	/**
	 * This is just a base interface.
	 */
	export interface Location {
		type: string;
	}

	/**
	 * Location represent a single line in a single file.
	 */
	export interface SingleLineLocation extends Location {
		type: "line";

		line: number;

		path: Path;
	}

	/**
	 * Location represents another comment.
	 * We can use this to add a comment to a comment.
	 */
	export interface CommentLocation extends Location {
		type: "comment";

		/**
		 * Value of {@link Comment::identifier}.
		 */
		comment: string;

		/**
		 * Optional field, when multiple comments use the same comment
		 * as their location, this field can be used to defined their order.
		 * The lower values are put on top.
		 */
		order: number | undefined;
	}

	export interface Path {
		/**
		 * Relative path from the root of the repository.
		 *
		 * The path can be to a directory in such a case, it is directory wide
		 * comment.
		 *
		 * When the path is "/" it represent a summary comment for the whole
		 * repository.
		 *
		 * @example ./README.md
		 * @example ./data
		 * @example /
		 */
		path: [];
	}

	export interface Tag {
		identifier: string;

		/**
		 * Human readable label.
		 */
		label: string;

		/**
		 * Additional description.
		 */
		description: string;
	}

	/**
	 * This is what the application submit to {@link Configuration::api::write}.
	 *
	 * We do not send back {@link Repository} list as the user can not
	 * change that.
	 */
	export interface WriteApiRequest {
		/**
		 * Like a commit message.
		 */
		message: string;

		/**
		 * All the comments, preferable in the same order with new
		 * ones added at the end.
		 */
		comments: Comment[];
	}
}

/**
 * This is not visible to the user, but should be stored at the backend.
 */
namespace Internal {
	// Information we want to have at the backend.
	//  For example who and when changed a comment.
}
