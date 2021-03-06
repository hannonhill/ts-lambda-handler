import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
/**
 * An Handler to implement a REST endpoint.
 */
export declare abstract class RestfulHandler extends AbstractHandler {
    process(request: Request, response: Response): Promise<void>;
    /**
     * Determine if the request is for a specific entry. e.g.: retriving, updating, deleteing a specific record.
     *
     * When a request is meant to return a list of results or create a brand new record the function should return
     * false.
     */
    protected abstract isSingleRequest(): boolean;
    /**
     * Retrive a specific item from its ID. e.g.: `GET resource/123.json`
     * @return {Promise<void>}
     */
    protected abstract retrieveSingle(): Promise<void>;
    /**
     * Retrieve a list of results
     * @return {Promise<void>}
     */
    protected abstract search(): Promise<void>;
    /**
     * Create a new entry
     */
    protected abstract create(): Promise<void>;
    /**
     * Update an existing entry.
     */
    protected abstract update(): Promise<void>;
    /**
     * Delete an entry.
     */
    protected abstract delete(): Promise<void>;
    /**
     * Respond to a preflight (OPTIONS) request. Used to return CORS headers.
     */
    protected preflight(): Promise<void>;
}
